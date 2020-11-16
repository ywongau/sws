import { Companies, loading } from './components/Companies';
import React, { useEffect, useReducer, useRef } from 'react';
import { initialState, reducer } from './reducer';

import { Filters } from './components/Filters';
import { pageSize } from './constants';
import { search } from './api';

interface Props {
  name?: string;
}

const loadMoreThreshold = 100;
const App: React.FunctionComponent<Props> = ({ name }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let _requestCanceled = false;
    search(
      state.offset,
      pageSize,
      state.sortField,
      state.sortOrder,
      state.countryCode
    ).then(data => {
      if (!_requestCanceled) {
        dispatch({ type: 'result', payload: data });
      }
    }, console.error);
    return () => {
      _requestCanceled = true;
    };
  }, [state.offset, state.sortField, state.sortOrder, state.countryCode]);

  const scrollContainerRef = useRef();

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current as HTMLElement;
    const onScroll = e => {
      const content = scrollContainer.querySelector('.companies');
      if (
        e.target.scrollTop + scrollContainer.clientHeight >=
          content.clientHeight - loadMoreThreshold &&
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

  const marketChanged = e => {
    const countryCode = e.target.value;
    dispatch({ type: 'countryChanged', payload: countryCode });
  };

  const sortingChanged = e => {
    const sorting = e.target.value;
    const [sortField, sortOrder] = sorting.split(/\s/);
    dispatch({ type: 'sortingChanged', payload: { sortField, sortOrder } });
  };

  return (
    <>
      <header className="main-header">
        <h1>{name}</h1>
        <Filters
          className="filters"
          onMarketChanged={marketChanged}
          onSortingChanged={sortingChanged}/>
      </header>
      <main ref={scrollContainerRef}>
        <>
          <Companies companies={state.companies}  />
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
