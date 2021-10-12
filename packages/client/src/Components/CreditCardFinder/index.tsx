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

<<<<<<< HEAD
    const [transformedData, setTransformedData] = useState<Data>([]);

    const getData = async () => {
        const response = await fetch(`/api/transactions`, { method: "GET" });
        const data = await response.json();
        if (data.error != null) {
        return;
        }
        setTransformedData(transformTransactionsData(data));
=======
    const [showTable, setShowTable] = useState(false);
    const [transformedData, setTransformedData] = useState<Data>([]);
    const [pdf, setPdf] = useState<string | null>(null);
    const [error, setError] = useState<ErrorDataItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getData = async () => {
        setIsLoading(true);
        const response = await fetch(`/api/transactions`, { method: "GET" });
        const data = await response.json();
        if (data.error != null) {
        setError(data.error);
        setIsLoading(false);
        return;
        }
        setTransformedData(transformTransactionsData(data)); // transform data into proper format for each individual product
        if (data.pdf != null) {
        setPdf(data.pdf);
        }
        setShowTable(true);
        setIsLoading(false);
>>>>>>> 6939e7111332c2f2e4d85eff85dd6b42bfe696be
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
<<<<<<< HEAD
    
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
=======
    
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

               
    
>>>>>>> 6939e7111332c2f2e4d85eff85dd6b42bfe696be

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