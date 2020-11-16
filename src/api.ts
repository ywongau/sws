import { endpoint } from './constants';

const getCountryCodeRule = countryCode => [
  'aor',
  [['country_name', 'in', [countryCode]]],
];
export const search = (
  offset,
  size,
  orderByField,
  orderDirection,
  countryCode
) =>
  fetch(endpoint, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    referrerPolicy: 'no-referrer',
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    body: JSON.stringify({
      id: '0',
      no_result_if_limit: false,
      offset,
      size,
      state: 'read',
      rules: JSON.stringify([
        ['order_by', orderByField, orderDirection],
        ['primary_flag', '=', true],
        ['grid_visible_flag', '=', true],
        ['market_cap', 'is_not_null'],
        ['is_fund', '=', false],
        ...(countryCode ? [getCountryCodeRule(countryCode)] : []),
      ]),
    }),
  }).then(x => (x.ok ? Promise.resolve(x.json()) : Promise.reject(x)));
