import React, { useContext } from "react";
import Callout from "plaid-threads/Callout";
import Button from "plaid-threads/Button";
import InlineLink from "plaid-threads/InlineLink";

import { Link } from "../link/Link";
import Context from "../../context/Context";

import "./Headers.scss";

export const Header = () => {
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
    <div className='grid'>
      <h3 className='title'>Credit Card Finder</h3>

      {!linkSuccess ? (
        <>
          {/* message if backend is not running and there is no link token */}
          {!backend ? (
            <Callout warning>
              Unable to fetch link_token: please make sure your backend server
              is running and that your .env file has been configured with your
              <code>PLAID_CLIENT_ID</code> and <code>PLAID_SECRET</code>.
            </Callout>
          ) : /* message if backend is running and there is no link token */
          linkToken == null && backend ? (
            <Callout warning>
              <div>
                Unable to fetch link_token: please make sure your backend server
                is running and that your .env file has been configured
                correctly.
              </div>
              <div>
                Error Code: <code>{linkTokenError.error_code}</code>
              </div>
              <div>
                Error Type: <code>{linkTokenError.error_type}</code>{" "}
              </div>
              <div>Error Message: {linkTokenError.error_message}</div>
            </Callout>
          ) : linkToken === "" ? (
            <div className='linkButton'>
              <Button large disabled>
                Loading...
              </Button>
            </div>
          ) : (
            <div className='linkButton'>
              <Link />
            </div>
          )}
        </>
      ) : (
        <>
          {isItemAccess ? (
            <h4 className='subtitle'>
              Congrats! By linking an account, you have created an{" "}
              <InlineLink
                href="http://plaid.com/docs/quickstart/glossary/#item"
                target="_blank"
              >
                Item
              </InlineLink>
              .
            </h4>
          ) : (
            <h4 className='subtitle'>
              <Callout warning>
                Unable to create an item. Please check your backend server
              </Callout>
            </h4>
          )}
          <div className='itemAccessContainer'>
            <p className='itemAccessRow'>
              <span className='idName'>item_id</span>
              <span className='tokenText'>{itemId}</span>
            </p>

            <p className='itemAccessRow'>
              <span className='idName'>access_token</span>
              <span className='tokenText'>{accessToken}</span>
            </p>
          </div>
          {isItemAccess && (
            <p className='requests'>
              Now that you have an access_token, you can make all of the
              following requests:
            </p>
          )}
        </>
      )}
    </div>
  );
};
