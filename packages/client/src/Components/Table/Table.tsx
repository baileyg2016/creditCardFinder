import React from "react";

import { DataItem, Categories } from "../../dataUtilities";
import { Identity } from "../identity/Identity";

import "./Table.scss";

interface Props {
  data: Array<DataItem>;
  categories: Array<Categories>;
  isIdentity: boolean;
}

export const Table = (props: Props) => {
  const maxRows = 15;
  // regular table
  const headers = props.categories.map((category, index) => (
    <th key={index} className='headerField'>
      {category.title}
    </th>
  ));

  const rows = props.data
    .map((item: DataItem | any, index) => (
      <tr key={index} className='dataRows'>
        {props.categories.map((category: Categories, index) => (
          <td key={index} className='dataField'>
            {item[category.field]}
          </td>
        ))}
      </tr>
    ))
    .slice(0, maxRows);

  return props.isIdentity ? (
    <Identity data={props.data} categories={props.categories} />
  ) : (
    <table className='dataTable'>
      <thead className='header'>
        <tr className='headerRow'>{headers}</tr>
      </thead>
      <tbody className='body'>{rows}</tbody>
    </table>
  );
};
