import React, { useEffect, useContext, useCallback } from "react";

import { CreditCardFinder } from "./components/credit-card-finder/CreditCardFinder";
import Context from "./context/Context";

import "./App.scss";
import { AccountsContextProvider } from "./context/AccountsContextProvider";
import { Header } from "./components/headers/Headers";

const App = () => {
  const { linkSuccess, isItemAccess, dispatch } = useContext(Context);

  const getInfo = useCallback(async () => {
    const response = await fetch(`${process.env.API}/api/info`, { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean = data.products.includes(
      "payment_initiation"
    );
    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
      },
    });
    return { paymentInitiation };
  }, [dispatch]);

  const generateToken = useCallback(
    async (paymentInitiation) => {
      const path = paymentInitiation
        ? "/api/create_link_token_for_payment"
        : "/api/create_link_token";
      const response = await fetch(`${process.env.API}${path}`, {
        method: "POST",
      });

      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }

      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });

          return;
        }

        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }

      localStorage.setItem("link_token", data.link_token); //to use later for Oauth
    },
    [dispatch]
  );

  const getAccessToken = React.useCallback(
    (public_token: string) => {
      // send public_token to server
      const setToken = async () => {
        const response = await fetch(`${process.env.API}/api/set_access_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          body: `public_token=${public_token}`,
        });

        if (!response.ok) {
          dispatch({
            type: "SET_STATE",
            state: {
              itemId: `no item_id retrieved`,
              accessToken: `no access_token retrieved`,
              isItemAccess: false,
            },
          });
          return;
        }
        const data = await response.json();

        dispatch({
          type: "SET_STATE",
          state: {
            itemId: data.item_id,
            accessToken: data.access_token,
            isItemAccess: true,
          },
        });
      };
      setToken();
      dispatch({ type: "SET_STATE", state: { linkSuccess: true } });
      window.history.pushState("", "", "/");
    },
    [dispatch]
  );

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token

      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
      } else if (process.env.NODE_ENV === 'development' && localStorage.getItem("link_token")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkSuccess: true,
            isItemAccess: true
          },
        });
      } else {
        generateToken(paymentInitiation);
      }
    };

    init();
  }, [dispatch, generateToken, getInfo]);

  return (
    <div className='App'>
      <div className='container'>
        <h3 className='title'>Credit Card Finder</h3>
        {linkSuccess && isItemAccess ? (
          <AccountsContextProvider accessToken={""} itemId={""} itemName={""} linkToken={""}>
            <CreditCardFinder />
          </AccountsContextProvider>
        ) : (
          <Header />
        )}
      </div>
    </div>
  );
};

export default App;
