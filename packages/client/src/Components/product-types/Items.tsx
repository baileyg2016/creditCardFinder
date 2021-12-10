import React from "react";

import Endpoint from "../endpoint/Endpoint";
import ProductTypesContainer from "./product-types-container/ProductTypesContainer";
import {
  transformItemData,
  transformAccountsData,
  itemCategories,
  accountsCategories,
} from "../../dataUtilities";

const Items = () => (
  <>
    <ProductTypesContainer productType="Item Management">
      <Endpoint
        endpoint="item"
        categories={itemCategories}
        schema="/item/get/"
        description="Retrieve information about an Item, like the institution,
        billed products, available products, and webhook
        information."
        transformData={transformItemData}
      />
      <Endpoint
        endpoint="accounts"
        schema="/accounts/get"
        categories={accountsCategories}
        description="Retrieve high-level information about all accounts associated with an item."
        transformData={transformAccountsData}
      />
    </ProductTypesContainer>
  </>
);

Items.displayName = "Items";

export default Items;
