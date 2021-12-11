import React from "react";

import { DataItem, Categories } from "../../dataUtilities";

import "./Identity.styles.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
}

export const Identity = (props: Props) => {
  const identityHeaders = props.categories.map((category, index) => (
    <span key={index} className='identityHeader'>
      {category.title}
    </span>
  ));

  const identityRows = props.data.map((item: DataItem | any, index) => (
    <div key={index} className='identityDataRow'>
      {props.categories.map((category: Categories, index) => (
        <span key={index} className='identityDataField'>
          {item[category.field]}
        </span>
      ))}
    </div>
  ));

  return (
    <div className='identityTable'>
      <div className='identityHeadersRow'>{identityHeaders}</div>
      <div className='identityDataBody'>{identityRows}</div>
    </div>
  );
};
