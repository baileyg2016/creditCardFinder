import React, { useContext } from "react";

import { Endpoint } from "../endpoint/Endpoint";
import Context from "../../context/Context";
import ProductTypesContainer from "./product-types-container/ProductTypesContainer";
import {
  transactionsCategories,
  authCategories,
  identityCategories,
  balanceCategories,
  investmentsCategories,
  paymentCategories,
  assetsCategories,
  transformAuthData,
  transformTransactionsData,
  transformBalanceData,
  transformInvestmentsData,
  transformIdentityData,
  transformPaymentData,
  transformAssetsData,
} from "../../dataUtilities";

const Products = () => {
  const { products } = useContext(Context);
  return (
    <ProductTypesContainer productType="Products">
      {products.includes("payment_initiation") && (
        <Endpoint
          endpoint="payment"
          name="Payment"
          categories={paymentCategories}
          schema="/payment/get/"
          description="Retrieve information about your latest payment."
          transformData={transformPaymentData}
        />
      )}
      <Endpoint
        endpoint="auth"
        name="Auth"
        categories={authCategories}
        schema="/auth/get/"
        description="Retrieve account and routing numbers for checking and savings accounts."
        transformData={transformAuthData}
      />
      <Endpoint
        endpoint="transactions"
        name="Transactions"
        categories={transactionsCategories}
        schema="/transactions/get/"
        description="Retrieve transactions for credit and depository accounts."
        transformData={transformTransactionsData}
      />
      <Endpoint
        endpoint="identity"
        name="Identity"
        categories={identityCategories}
        schema="/identity/get/"
        description="Retrieve Identity information on file with the bank. Reduce
        fraud by comparing user-submitted data to validate identity."
        transformData={transformIdentityData}
      />
      {products.includes("assets") && (
        <Endpoint
          endpoint="assets"
          name="Assets"
          categories={assetsCategories}
          schema="/assets_report/get/"
          description="Create and retrieve assets information an asset report"
          transformData={transformAssetsData}
        />
      )}
      <Endpoint
        endpoint="balance"
        name="Balance"
        categories={balanceCategories}
        schema="/accounts/balance/get/"
        description="Check balances in real time to prevent non-sufficient funds
        fees."
        transformData={transformBalanceData}
      />
      <Endpoint
        endpoint="holdings"
        name="Investments"
        categories={investmentsCategories}
        schema="/investments/holdings/get/"
        description="Retrieve investment holdings on file with the bank,
        brokerage, or investment institution. Analyze over-exposure
        to market segments."
        transformData={transformInvestmentsData}
      />
    </ProductTypesContainer>
  );
};

Products.displayName = "Products";

export default Products;
