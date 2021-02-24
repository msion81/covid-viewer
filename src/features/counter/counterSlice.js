import { createSlice } from '@reduxjs/toolkit';
import { ajax } from 'rxjs/ajax';
import { of, forkJoin } from 'rxjs';
import { map,catchError } from "rxjs/operators";
import moment from 'moment';

const baseChatdata = [[ 'Days', 'Cases', 'Deaths']];
const baseUrlApi = 'https://api.covidtracking.com/v2/';
/*
* Store section & Actions
*/
export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    dateLimit: 7,
    rawData: null,
    rawTableData: null,
    states: null,
    historical: null,
    infoState: 'idle'
  },
  reducers: {
    stateFulFilled: (state, action) => {
      state.states = action.payload;
    },
    historicalFulFilled: (state, action) => {
      const {historical, chart } = action.payload;
      state.historical = historical;
      state.rawData = chart;
    },
    rawDataUpdated: (state, action) => {
      state.rawData = action.payload;
    },
    tableDataFulFilled: (state, action) => {
      state.rawTableData = action.payload;
    },
    infoStateChanged: (state, action) => {
      state.infoState = action.payload
    },
    dateLimitChanged: (state, action) => {
      state.dateLimit = action.payload
    }
  },
});

export const { 
  stateFulFilled, 
  historicalFulFilled, 
  tableDataFulFilled, 
  infoStateChanged, 
  dateLimitChanged,
  rawDataUpdated,
} = counterSlice.actions;

/*
* Middle-ware
*/
const loadStateList = () => {
  return ajax.getJSON(`${baseUrlApi}states.json`)
    .pipe(
      map(({data}) => data),
    )
};

const loadRegionHistorical = (dateLimit, regionParam) => {
  const region = regionParam ? `states/${regionParam}`  : 'us';
  return ajax.getJSON(`${baseUrlApi}${region}/daily.json`)
    .pipe(
      map(
        ({data:historical}) => ({
          historical, 
          chart: filterHistoricalByDateLimit(historical, dateLimit),
        })
      ),
    )
}

const filterHistoricalByDateLimit = (historical, dateLimit) => {
  const infLimit = dateLimit ? moment().subtract(1, 'days').subtract(dateLimit, 'days') : moment('2020-01-01');
  const dateFormat = dateLimit ? 'MM-DD' : 'YYYY-MM-DD';
  const newRawData = historical.reduce(
    (historicalData, item) => {
      const itemDate = moment(item.date);
      if (itemDate.isBetween(infLimit)) {
        historicalData.push([
          itemDate.format(dateFormat), 
          ((item.cases.total.value)/1000),
          ((item.outcomes.death.total.value)/1000)
        ])
      }
      return historicalData
    }
    , []).reverse();
  return [ ...baseChatdata, ...newRawData];
}

export const loadStatesDataByDate = (date) => (dispatch, getState)  => {
  const {counter} = getState();
  const {states, dateLimit} = counter;
  const specificDate = dateLimit ? `2021-${date}.json` : `${date}.json`;
  const codeStates$ = states.map(state => 
    ajax.getJSON(`${baseUrlApi}states/${state.state_code.toLowerCase()}/${specificDate}`)
    .pipe(
      map(({data}) => data),
      catchError(() => of({state: state.state_code}))
    )
  );
  // 
  return forkJoin([...codeStates$])
    .pipe(
      map(stateData => stateData.map(
        item => (
          {
            infects: item.cases?.total.value,
            deaths: item.outcomes?.death.total.value,
            ...states.find(state => state.state_code === item.state)
          }
        )
      ))
    )
    .subscribe(
      tableData => dispatch(tableDataFulFilled(tableData))
    )
}

export const loadAllData = (dispatch, getState)  => {
  const {dateLimit} = getState().counter;

  return forkJoin({
    states: loadStateList(),
    historical: loadRegionHistorical(dateLimit)
  })
  .pipe(
    catchError(() => dispatch(infoStateChanged('error')))
  )
  .subscribe(
    ({historical, states}) => {
      dispatch(stateFulFilled(states));
      dispatch(historicalFulFilled(historical));
      dispatch(infoStateChanged('success'))
    }
  );
}

export const loadStateData = (state) => (dispatch, getState) => {
  const {dateLimit, states} = getState().counter;
  const apiObj = !states ? { states: loadStateList() } : {};
  return forkJoin({
    ...apiObj,
    historical: loadRegionHistorical(dateLimit, state)
  })
  .pipe(
    catchError(() => dispatch(infoStateChanged('error')))
  )
  .subscribe(
    ({historical, states}) => {
      states && dispatch(stateFulFilled(states));
      dispatch(historicalFulFilled(historical));
      dispatch(infoStateChanged('success'));
    }
  );
}

export const updateDateLimit = (dateLimit, stateMode) => (dispatch, getState)  => {
  const {historical} = getState().counter;
  const newRawData = filterHistoricalByDateLimit(historical, dateLimit);
  dispatch(dateLimitChanged(dateLimit));
  dispatch(rawDataUpdated(newRawData));
  if (!stateMode){
    dispatch(tableDataFulFilled(null));
  }
  
}

/*
* Selectors
*/
export const selectRawData = state => state.counter.rawData;
export const selectRawTableData = state => state.counter.rawTableData;
export const selectStatesData = state => state.counter.states;
export const selectInfoState = state => state.counter.infoState;

export default counterSlice.reducer;
