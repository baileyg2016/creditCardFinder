import React, { createContext, FC } from 'react';

export interface IAccountsContextProps {
    itemId: string,
    itemName: string,
    linkToken: string,
    accessToken: string,
}

export const AccountsContext = createContext({} as IAccountsContextProps);

export const AccountsContextProvider: FC<IAccountsContextProps> = (props) => {
    return (
        <AccountsContext.Provider value={props}>
            {props.children}
        </AccountsContext.Provider>
    )
}