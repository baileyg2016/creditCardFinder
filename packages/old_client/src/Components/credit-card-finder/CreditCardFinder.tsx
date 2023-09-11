import React, { useCallback, useEffect, useState } from "react";

import "./CreditCardFinder.scss";
import {
    Data,
    DataItem,
    transformTransactionsData,
} from "../../dataUtilities";
import cards from '../../creditCards/creditCards.json';

export const CreditCardFinder = () => {
    const [transformedData, setTransformedData] = useState<Data>([]);
    const [categories, setCategories] = useState<Array<string>>([]);
    const [amounts, setAmounts] = useState<Array<number>>([]);
    const [totalPoints, setTotalPoints] = useState<Array<{name: string, points: number, fee: number}>>([]);

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
            const amountString = dataItem["amount"] ?? 0;
            
            let amount : number = +(amountString.replace("USD", ""));
    
            if (category == null) {
                return; 
            }
            else {
                const newAmount = amounts_by_category.has(category) ? amounts_by_category.get(category) as number + amount : amount;
                amounts_by_category.set(category, newAmount)
            }
            return amounts_by_category;
        }); 
    
    
        const categories: Array<string> = [];       
        const amounts: Array<number> = [];
        
        amounts_by_category.forEach((value: number, key: string) => {
            categories.push(key);
            amounts.push(value || 0);
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
                    total += points.All * amounts[index];
                } else if (points.hasOwnProperty(category)) {
                    if (points.hasOwnProperty('Shops')) {
                        console.log(points)
                        const key = Object.keys(points.Shops)[0]
                        total += ((points?.Shops?.[key] as number) * amounts[index])
                    } else {
                        // need to create a type/interface for category
                        // @ts-ignore
                        total += (points?.[category] as number) * amounts[index]
                    }
                } else {
                    total += (points["Everything else"] as number) * amounts[index]
                }
            });

            return {
                name,
                points: Math.round(total),
                fee
            }
        });

        setTotalPoints(cardPoints);
        return cardPoints;
    }, [amounts, categories]);

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
        if (amounts.length > 0) {
            setTotalPoints(calculateCards())
        }
    }, [amounts, calculateCards]);



    return (    
        <>
            <h3 className='subtitle'>Find the Credit card for you please</h3>
            <div className='CreditCardFinder'>
                <table>
                    <thead>
                        <tr>
                            <td>Point totals</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Card</td>
                            <td>Total Points</td>
                            <td>Fee</td>
                        </tr>
                        {
                            totalPoints.map((card, index) => (
                                <tr key={card.name} className='dataField'>
                                    <td>{card.name}</td>
                                    <td>{card.points}</td>
                                    <td>${card.fee}</td>
                                </tr>
                                // <Card cardInfo={{...card, id: index}}  />
                            ))
                        }
                    </tbody>
                </table>
            </div>  
        </>
    )
};
