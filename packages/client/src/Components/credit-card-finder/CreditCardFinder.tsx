import React, { useCallback, useEffect, useState } from "react";

import "./CreditCardFinder.scss";
import {
    Data,
    DataItem,
    transformTransactionsData,
} from "../../dataUtilities";
import cards from '../../creditCards/creditCards.json';

export const CreditCardFinder = () => {
    // const {
    //     itemId,
    //     accessToken,
    //     linkToken,
    //     linkSuccess,
    //     isItemAccess,
    //     backend,
    //     linkTokenError,
    // } = useContext(Context);

    const [transformedData, setTransformedData] = useState<Data>([]);
    const [categories, setCategories] = useState<Array<string>>([]);
    const [amounts, setAmounts] = useState<Array<number>>([]);
    const [totalPoints, setTotalPoints] = useState<Array<{name: string, points: number}>>([]);

    const getData = async () => {
        const response = await fetch(`${process.env.API}/api/transactions`, { method: "GET" });
        const data = await response.json();
        if (data.error != null) {
            return;
        }
        setTransformedData(transformTransactionsData(data));
    };

    const getCategories = useCallback(async () => {
        let amounts_by_category : Map<string, number> = new Map();
        transformedData.map((dataItem : DataItem | any) => {
    
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
        });

        setCategories(categories);
        setAmounts(amounts);
    }, [transformedData]);

    const calculateCards = useCallback(() => {
        const cardPoints = cards.cards.map(({ name, points, fee }, _index) => {
            const total = 0;

            

            return {
                name,
                points: total,
            }
        });
        setTotalPoints(cardPoints);
    }, []);

    useEffect(() => {
        const init = async () => {
            await getData();
        };

        init();
    }, []);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    return (    
        <>
            <h3 className='title'>Find the Credit card for you please</h3>
            <div className='CreditCardFinder'>
                <table>
                    <thead>
                        <td>Transaction history</td>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Category</td>
                            <td>Transaction</td>
                        </tr>
                        {
                            categories.map((category: string, index) => (
                                <tr key={category} className='dataField'>
                                    <td>{category}</td>
                                    <td>{amounts[index]}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>  
        </>
    )
};
