import React, { useEffect, useReducer, useRef } from 'react';
import { markets, pageSize } from './constants';

import { Companies } from './Companies';
import { reducer } from './reducer';
import { search } from './api';

interface Props {
  name?: string;
}
const marketEntries = Object.entries(markets);

const loading = (
  <ul className="companies loading" data-testid="loading">
    {Array(pageSize)
      .fill(undefined)
      .map((_, i) => (
        <li key={i}>
          <article></article>
        </li>
      ))}
  </ul>
);

const App: React.FunctionComponent<Props> = ({ name }) => {
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    error: false,
    countryCode: '',
    sortOrder: 'desc',
    sortField: 'market_cap',
    companies: [],
    offset: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    let _requestCanceled = false;
    search(
      state.offset,
      pageSize,
      state.sortField,
      state.sortOrder,
      state.countryCode
    ).then((x) => {
      if (!_requestCanceled) {
        dispatch({ type: 'result', payload: x });
      }
    }, console.error);
    return () => {
      _requestCanceled = true;
    };
  }, [state.offset, state.sortField, state.sortOrder, state.countryCode]);

  const scrollContainerRef = useRef();

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current as HTMLElement;
    const onScroll = (e) => {
      const content = scrollContainer.querySelector('.companies');
      if (
        e.target.scrollTop + scrollContainer.clientHeight >=
          content.clientHeight &&
        state.companies.length < state.totalRecords
      ) {
        dispatch({
          type: 'loadMore',
          payload: state.companies.length,
        });
        scrollContainer.removeEventListener('scroll', onScroll);
      }
    };
    scrollContainer.addEventListener('scroll', onScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', onScroll);
    };
  }, [state.totalRecords, state.companies.length]);

  const marketChanged = (e) => {
    const countryCode = e.target.value;
    dispatch({ type: 'countryChanged', payload: countryCode });
  };

  const sortingChanged = (e) => {
    const sorting = e.target.value;
    const [sortField, sortOrder] = sorting.split(/\s/);
    dispatch({ type: 'sortingChanged', payload: { sortField, sortOrder } });
  };

  return (
    <>
      <header className="main-header">
        <h1>{name}</h1>
        <ul className="filters">
          <li>
            <label>
              <span>Market</span>
              <select onChange={marketChanged}>
                <option value="">Global</option>
                {marketEntries.map(([code, label]) => (
                  <option value={code} key={code}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </li>
          <li>
            <label>
              <span>Sort by</span>
              <select onChange={sortingChanged}>
                <option value="market_cap desc">Market Cap Descending</option>
                <option value="market_cap asc">Market Cap Ascending</option>
              </select>
            </label>
          </li>
        </ul>
      </header>
      <main ref={scrollContainerRef}>
        <>
          <Companies companies={state.companies} className="companies" />
          {state.loading ? loading : null}
        </>
      </main>
    </>
  );
};
App.defaultProps = {
  name: 'Grid',
};
export { App };
