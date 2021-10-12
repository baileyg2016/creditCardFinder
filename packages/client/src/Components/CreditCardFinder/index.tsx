import React, { useContext, useEffect, useState } from "react";

import Context from "../../Context";
import Endpoint from "../Endpoint";
import styles from "./index.module.scss";
import {
    Data,
    DataItem,
    ErrorDataItem,
    transactionsCategories,
    transformTransactionsData,

  } from "../../dataUtilities";
import Table from "../Table";
const CreditCardFinder = () => {
    const {
        itemId,
        accessToken,
        linkToken,
        linkSuccess,
        isItemAccess,
        backend,
        linkTokenError,
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
    }, );


    let amounts_by_category : Map<string, number> = new Map();
    transformedData.forEach((dataItem : DataItem | any) => {

        // Categories Key
        const categories : Array<string> = dataItem["category"];
        // Amount Value
        console.log(dataItem["amount"])
        const amountString = dataItem["amount"];
        
        let amount : number = +(amountString.replace("USD", ""));
        console.log(amount)
        if (categories == null) {
            return; 
        }
        else {
            categories.forEach((category : string) => {
                amount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
                amounts_by_category.set(category, amount);
            });
        }
        return amounts_by_category;
    }); 


    const categories: Array<string> = [];       
    const amounts: Array<number> = [];
    
    amounts_by_category.forEach((value: number, key: string) => { 
            categories.push(key);
            amounts.push(value);
    })

    const rows = categories.map((category: string, index) => {
        return (
            <h3 key={category} className={styles.dataField}>
                {category + " " + amounts[index]}
            </h3>
        )
    })

    return (    
        <>
        <h3 className={styles.title}>Find the Credit card for you please</h3>
        <div className='CreditCardFinder'>
        <>
        {rows}
        </></div>  
        </>
    )
};




CreditCardFinder.displayName = "Credit Card Finder";

export default CreditCardFinder