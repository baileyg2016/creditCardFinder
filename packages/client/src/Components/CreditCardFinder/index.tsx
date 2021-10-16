import React, { useContext, useEffect, useState } from "react";

import Context from "../../Context";
import styles from "./index.module.scss";
import {
    CategoryAmountCategories,
    Data,
    DataItem,
    transformTransactionsData,
} from "../../dataUtilities";
import Table from "../Table";

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
    }, [transformedData, setTransformedData]);


    let amounts_by_category : Map<string, number> = new Map();

    transformedData.forEach((dataItem : DataItem | any) => {
        let amounts_by_category : Map<string, number> = new Map();
        // Categories Key
        const categories : Array<string> = dataItem["category"];
        // Amount Value
        const amountString = dataItem["amount"];
        
        let amount : number = +(amountString.replace("USD", ""));
        if (categories === null || categories.length === 0) {
            return; 
        }
        else {
            const category = categories[0];
            amount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
            amounts_by_category.set(category, amount);
        }
        return amounts_by_category;
    }); 
    

    const creditCard : Array<DataItem> = Array.from(amounts_by_category).map((dataItem: [string, number]) => {
        const item: DataItem = {
            category : dataItem[0],
            amount: dataItem[1].toString()
          };
          return item; 
    })

    return (    
        <>
            <h3 className={styles.title}>Find the Credit card for you please</h3>
            <div className='CreditCardFinder'>
            <>
                <Table
                categories={CategoryAmountCategories}
                data={creditCard}
                isIdentity={false}/>
            </>
            </div>  
        </>
    )
};




CreditCardFinder.displayName = "Credit Card Finder";

export default CreditCardFinder