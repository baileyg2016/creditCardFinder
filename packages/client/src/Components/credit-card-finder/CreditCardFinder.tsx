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
            let total = 0;

            // need to do some brainstorming and change how i am storing the data 
            // for this part

            categories.map((category: string, index: number) => {
                if (points.All) {
                    total += points.All * amounts[index]
                } else if (points.hasOwnProperty(category)) {
                    if (points.hasOwnProperty('Shops')) {
                        console.log('shops')
                        console.log(points)
                        console.log(points.Shops)
                        console.log('Category------', category)
                        const key = Object.keys(points.Shops)[0]

                        console.log(points.Shops[key])
                        console.log()
                        const shopsPoints = points.Shops[key]
                        total += shopsPoints * amounts[index]
                    } else {
                        // need to create a type/interface for category
                        // @ts-ignore
                        total += (points?.[category] as number) * amounts[index]
                    }
                } else {
                    total += (points["Everything else"] as number) * amounts[index]
                }
                console.log('points', points[category])
                console.log(total)
            });

            return {
                name,
                points: total,
                fee
            }
        });
        setTotalPoints(cardPoints);
        return cardPoints;
    }, [amounts, cards, categories]);

    useEffect(() => {
        const init = async () => {
            await getData();
        };

        init();
    }, []);

    useEffect(() => {
        getCategories();
    }, [getCategories]);

    useEffect(() => {
        const calculation = calculateCards();
        console.log('here is the calculation:');
        console.log(calculation);
        console.log(totalPoints)
    }, [calculateCards]);



    return (    
        <>
            <h3 className='title'>Find the Credit card for you please</h3>
            <div className='CreditCardFinder'>
                <table>
                    <thead>
                        <tr>
                            <td>Transaction history</td>
                        </tr>
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
