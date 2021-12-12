import React, { useContext, useEffect, useState } from "react";

import Context from "../../context/Context";
import "./CreditCardFinder.scss";
import {
    Data,
    DataItem,
    transformTransactionsData,
} from "../../dataUtilities";

export const CreditCardFinder = () => {
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
        const response = await fetch(`${process.env.API}/api/transactions`, { method: "GET" });
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
        const category = dataItem["category"][0];
        // Amount Value
        console.log(dataItem["amount"])
        const amountString = dataItem["amount"] ?? 0;
        
        let amount : number = +(amountString.replace("USD", ""));

        if (category == null) {
            return; 
        }
        else {
            // categories.forEach((category : string) => {
            //     amount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
            //     amounts_by_category.set(category, amount);
            // });
            console.log("\n")
            console.log(dataItem["name"])
            console.log(dataItem["category"])
            console.log(dataItem["amount"])
            const newAmount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
            amounts_by_category.set(category, newAmount)
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
            <tr key={category} className='dataField'>
                <td>{category}</td>
                <td>{amounts[index]}</td>
            </tr>
        )
    })

    return (    
        <>
            <h3 className='title'>Find the Credit card for you please</h3>
            <div className='CreditCardFinder'>
                <table>
                    <thead>
                        <tr>Transaction history</tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Category</td>
                            <td>Transaction</td>
                        </tr>
                        {rows}
                    </tbody>
                </table>
            </div>  
        </>
    )
};
