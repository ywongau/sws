// @ts-nocheck
/// <reference types="jest"/>

import { coles, woolworths } from '../mocks/data';

import { endpoint } from './constants';
import { search } from './api';

const fetchMock = require('jest-fetch-mock');
const fakeData = {
  data: [woolworths, coles],
  meta: { total_records: 100 },
};
describe('api', () => {
  beforeEach(() => {
    fetchMock.mockIf(endpoint, () =>
      Promise.resolve({
        status: 200,
        body: JSON.stringify(fakeData),
      })
    );
  });
  afterEach(() => {
    fetchMock.mockRestore();
  });
  it('searches by country code', () => {
    fetchMock.mockIf(endpoint, (request) =>
      request.json().then((data) => {
        const rules = JSON.parse(data.rules);
        const orderBy = rules.find((x) => x[0] === 'order_by');
        const aor = rules.find((x) => x[0] === 'aor');
        expect(data.offset).toBe(30);
        expect(data.size).toBe(10);
        expect(orderBy).toEqual(['order_by', 'market_cap', 'desc']);
        expect(aor).toEqual(['aor', [['country_name', 'in', ['au']]]]);
        return Promise.resolve({
          status: 200,
          body: JSON.stringify(fakeData),
        });
      })
    );
    return search(30, 10, 'market_cap', 'desc', 'au').then((data) =>
      expect(data).toEqual(fakeData)
    );
  });
  it('searches without a country code', () => {
    fetchMock.mockIf(endpoint, (request) =>
      request.json().then((data) => {
        const rules = JSON.parse(data.rules);
        const aor = rules.find((x) => x[0] === 'aor');
        expect(aor).toBe(undefined);
        return Promise.resolve({
          status: 200,
          body: JSON.stringify(fakeData),
        });
      })
    );
    return search(30, 10, 'market_cap', 'desc', '');
  });
  it('rejects if status is not ok', () => {
    fetchMock.mockIf(endpoint, () =>
      Promise.resolve({
        status: 404,
      })
    );
    return search(30, 10, 'market_cap', 'desc', 'au')
      .then(() => fail('expected a rejection'))
      .catch(() => undefined);
  });
});
