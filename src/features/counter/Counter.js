import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  loadAllData,
  loadStateData,
  loadStatesDataByDate,
  selectRawData,
  selectRawTableData,
  selectStatesData,
  selectInfoState,
  updateDateLimit,
} from './counterSlice';
import styles from './Counter.module.css';
import { Chart } from "react-google-charts";
import {TableCovid} from "./Table";
import {
  useParams
} from "react-router-dom";


export function Counter(props) {
  const {'state-mode': stateMode, children } = props;
  const dispatch = useDispatch();
  const [dateLimit, setDateLimit] = useState(7);
  const [daySelected, setDaySelected] = useState('');
  const rawData = useSelector(selectRawData);
  const rawTableData = useSelector(selectRawTableData);
  const infoStatus = useSelector(selectInfoState);
  const states = useSelector(selectStatesData);
  const { state } = useParams();
  const paramState = stateMode && states && states.find( item => (item.state_code.toLowerCase() === state.toLowerCase()));
  const region = paramState ? paramState.name : 'US';
  //const errorMessage = infoStatus === 'error';
  let notLoaded = infoStatus === 'idle';
  
  useEffect(() => {
    if(stateMode) {
      dispatch(loadStateData(state));
    } else if (!rawData || !notLoaded)  {
      dispatch(loadAllData);
    }
  
  }, [state, stateMode, notLoaded, dispatch])

  

  const dateSelected = ({ chartWrapper }) => {
    const chart = chartWrapper.getChart()
    const selection = chart.getSelection()
    if (selection.length === 1 && !stateMode) {
      const [selectedItem] = selection
      const { row } = selectedItem;
      const [day] = rawData[row+1];
      setDaySelected(day);
      dispatch(loadStatesDataByDate(day));
    }
  }

  const handleChange = (event) => {
    const {value} = event.target;
    setDateLimit(value)
    dispatch(updateDateLimit(+value, state));
  };

  return (
    <>
      {children}
      <section className={styles.filters}>
        <h2> Stats for {region}</h2>
        <div>
          <label>Show last: </label>
          <div className={styles.select}>
            <select onChange={handleChange} value={dateLimit}>
              <option value="7">Week</option>
              <option value="30">30 days</option>  
              <option value="0">all data</option>
            </select>
            <div className={styles.select_arrow}></div>
          </div>
        </div>
      </section>
      <section className={styles.section}>
        { !notLoaded ? 
        <article className={styles.chart}>
          <Chart
            width={'100%'}
            height={'100%'}
            chartType="Histogram"
            data={rawData}
            options={{
              vAxis: { scaleType: 'mirrorLog' },
              hAxis: { title: 'Persons per Thousands' },
              legend: { position: 'bottom' },
              histogram: { 
                bucketSize: 500,
                
              },
              
            }}
            chartEvents={[
              {
                eventName: 'select',
                callback: dateSelected,
              }]}
          />
        </article> 
        : <p>loading...</p>
      
        }
        {rawTableData && !stateMode &&
        <>
          <h3>
            Stats by State - {daySelected}
          </h3>
          <article className={styles.chart}>
            <TableCovid rawTableData={rawTableData}></TableCovid> 
          </article>
        </>
        }
      </section>  
    </>
  );
}
