import React from 'react';
import styles from './Counter.module.css';
import {
  Link
} from "react-router-dom";


export function TableCovid(props) {
    const {rawTableData} = props;
    const numberFormat = new Intl.NumberFormat();
    let totalInfects = 0;
    let totalDeaths = 0;
    let granTotal= 0;
    const tableBody = rawTableData && rawTableData.map((state, index) => {
        const {infects, deaths } = state;
        const stateTotal = infects + deaths;
        totalInfects += infects;
        totalDeaths += deaths;
        granTotal += stateTotal;
        return (<tr key={index}>
            <td><Link to={{pathname: `/covid-viewer/${state.state_code.toLowerCase()}`}}>{state.name}</Link></td>
            <td className={styles.column__number}>{numberFormat.format(infects)}</td>
            <td className={styles.column__number}>{numberFormat.format(deaths)}</td>
            <td className={styles.column__number}>{numberFormat.format(stateTotal)}</td>
            </tr>)
    });

    return (
        <table className={styles.blueTable}>
          <thead>
            <tr>
              <th>State</th>
              <th>Infects</th>
              <th>Deaths</th>
              <th>Totals</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <td></td>
              <td className={styles.column__number}>{numberFormat.format(totalInfects)}</td>
              <td className={styles.column__number}>{numberFormat.format(totalDeaths)}</td>
              <td className={styles.column__number}>{numberFormat.format(granTotal)}</td>
            </tr>
          </tfoot>
          <tbody>
            {tableBody}
          </tbody>
        </table>
    )
}