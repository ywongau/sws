const visitors = {
  result: (state, action) => ({
    ...state,
    error: false,
    loading: false,
    companies: state.companies.concat(action.payload.data),
    totalRecords: action.payload.meta.total_records,
  }),
  countryChanged: (state, action) => ({
    ...state,
    error: false,
    loading: true,
    companies: [],
    offset: 0,
    countryCode: action.payload,
  }),
  sortingChanged: (state, action) => ({
    ...state,
    ...action.payload,
    error: false,
    loading: true,
    companies: [],
    offset: 0,
  }),
  loadMore: (state, action) => ({
    ...state,
    offset: action.payload,
    error: false,
    loading: true,
  }),
};
export const reducer = (state, action) =>
  visitors[action.type](state, action) || state;
