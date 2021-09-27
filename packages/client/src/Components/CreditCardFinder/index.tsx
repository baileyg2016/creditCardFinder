import React, { useContext } from "react";

import Context from "../../Context";
import styles from "./index.module.scss";

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
    
    return (
        <h3 className={styles.title}>Find the Credit card for you</h3>

        // Get the transactions of a user
        // Print the transactions of a user
        // Determine how much each transaction was for
        // Calculate points vs a credit card data base
        // return the amount of points per card
    )

};

CreditCardFinder.displayName = "Credit Card Finder";

export default CreditCardFinder