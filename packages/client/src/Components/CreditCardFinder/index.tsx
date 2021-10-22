import React, { useContext, useEffect, useState } from "react";
import Button from "plaid-threads/Button";
import Context from "../../Context";
import styles from "./index.module.scss";
import {
    CategoryAmountCategories,
    Data,
    DataItem,
    transformTransactionsData,
} from "../../dataUtilities";
import Table from "../Table";



interface Props {
    url : string;
}

const CreditCardLink = (props : Props) => {
    const goToUrl = async () => {
        window.location.href = props.url;
    }

    return (
            <Button onClick={goToUrl} className={styles.getCard}>
                Get Card
            </Button>
        )
}

const CreditCardFinder = () => {
    const {
        itemId,
        backend,
    } = useContext(Context);

    const [transformedData, setTransformedData] = useState<Data>([]);

    const getData = async () => {
        const response = await fetch(`/api/transactions`, { method: "GET" });
        const data = await response.json();
        if (data.error != null) {
            return;
        }
        setTransformedData(transformTransactionsData(data));
    };

    useEffect(() => {
        getData(); 
    }, []);

    let amounts_by_category : Map<string, number> = new Map();

    transformedData.forEach((dataItem : DataItem | any) => {
        // Categories Key
        const categories : Array<string> = dataItem["category"];
        // Amount Value
        const amountString = dataItem["amount"].replace("USD", "").replace(",", "");
        let amount : number = parseFloat(amountString);
        if (categories !== undefined && categories.length !== 0) {
          const category = categories[0];
          amount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
          amount = Math.round(amount * 100) / 100;
          amounts_by_category.set(category, amount); 
        }
    }); 

    const creditCard : Array<DataItem> = Array.from(amounts_by_category).map((dataItem: [string, number]) => {
        const item: DataItem = {
            category : dataItem[0],
            amount: dataItem[1].toString(),
            // TODO: Add the links for each card to the url of the bank for that card
            link:  <CreditCardLink url="http://programminghead.com"/>,
          };
          return item; 
    }).sort(function(item1 : DataItem | any, item2 : DataItem | any) {
        return item2["amount"] - item1["amount"]
    })
    
    

    return (    
        <>
            <div className='CreditCardFinder'>
            <>
                <div>
                    <Table
                            categories={CategoryAmountCategories}
                            data={creditCard}
                            isIdentity={false}
                    />
                </div>
                
            </>
            </div>  
        </>
    )
};




CreditCardFinder.displayName = "Credit Card Finder";

export default CreditCardFinder