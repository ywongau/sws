// @ts-nocheck
/// <reference types="jest"/>

import { coles, woolworths } from '../../mocks/data';
import {
  getByText,
  render,
} from '@testing-library/react';

import { Companies } from './Companies';
import React from 'react';

const assertScore = (container, key, value) =>
  expect(getByText(container, key).nextSibling.textContent).toBe(value);
  
describe('app', () => {
  afterEach(async () => {
    await cleanup();
  });
  it('shows details of a company', () => {
    const { container } = render(<Companies companies={[coles]} />);
    getByText(container, 'Coles');
    getByText(container, 'symbol:coles');
    assertScore(container, 'Value', '0');
    assertScore(container, 'Income', '1');
    assertScore(container, 'Health', '2');
    assertScore(container, 'Past', '3');
    assertScore(container, 'Future', '4');
  });
  it('shows the list of companies', () => {
    const { container } = render(<Companies companies={[coles, woolworths]} />);
    getByText(container, 'Coles');
    getByText(container, 'Woolworths');
  });
});
