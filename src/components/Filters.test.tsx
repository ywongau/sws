// @ts-nocheck
/// <reference types="jest"/>

import {
  cleanup,
  fireEvent,
  getByLabelText,
  render,
} from '@testing-library/react';

import { Filters } from './Filters';
import React from 'react';

describe('Filters', () => {
  afterEach(async () => {
    await cleanup();
  });
  it('shows list of countries', () => {
    const { container, unmount } = render(<Filters />);
    const select = getByLabelText(container, 'Market');
    expect(select.value).toBe('');
    expect(select.options[0].textContent).toBe('Global');
    expect(select.options[1].value).toBe('ar');
    expect(select.options[1].textContent).toBe('Argentina');
    expect(select.options[2].textContent).toBe('Australia');
    unmount();
  });
  it('shows sorting options', () => {
    const { container, unmount } = render(<Filters />);
    const select = getByLabelText(container, 'Sort by');
    expect(select.value).toBe('market_cap desc');
    expect(select.options[0].textContent).toBe('Market Cap Descending');
    expect(select.options[0].value).toBe('market_cap desc');
    expect(select.options[0].textContent).toBe('Market Cap Descending');
    expect(select.options[1].value).toBe('market_cap asc');
    expect(select.options[1].textContent).toBe('Market Cap Ascending');
    unmount();
  });
  it('has onMarketChange event', () => {
    const onMarketChange = jest.fn();
    const { container, unmount } = render(
      <Filters
        onMarketChanged={onMarketChange}
      />
    );
    const select = getByLabelText(container, 'Market');
    fireEvent.change(select, { target: { value: 'au' } });
    const call = onMarketChange.mock.calls[0];
    expect(call[0].target.value).toBe('au');
    expect(call[0].type).toBe('change');
    unmount();
  });
  it('has onMarketChange event', () => {
    const onSortingChange = jest.fn();
    const { container, unmount } = render(
      <Filters
        onSortingChanged={onSortingChange}
      />
    );
    const select = getByLabelText(container, 'Sort by');
    fireEvent.change(select, { target: { value: 'market_cap asc' } });
    const call = onSortingChange.mock.calls[0];
    expect(call[0].target.value).toBe('market_cap asc');
    expect(call[0].type).toBe('change');
    unmount();
  });
});
