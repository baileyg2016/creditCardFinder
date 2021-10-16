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
        const categories : Array<string> = dataItem["category"];
        const amountString = dataItem["amount"];
        
        let amount : number = +(amountString.replace("USD", ""));
        if (categories == null) {
            return; 
        }
        else {
            categories.forEach((category : string) => {
                amount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
                amounts_by_category.set(category, amount);
            });
        }
    }); 
    

    const rows = Array.from(amounts_by_category).map((dataItem: [string, number]) => {
        return {
            category: dataItem[0],
            amount: dataItem[1]
        }
    })

    return (    
        <>
            <h3 className={styles.title}>Find the Credit card for you!</h3>
            <div className='CreditCardFinder'>
            <>
                <Table
                categories={CategoryAmountCategories}
                data={rows}
                isIdentity={false}
                />
            </>
            </div>  
        </>
    )
};

CreditCardFinder.displayName = "Credit Card Finder";

export default CreditCardFinder