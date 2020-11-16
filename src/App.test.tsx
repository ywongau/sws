// @ts-nocheck
/// <reference types="jest"/>

import {
  cleanup,
  findByText,
  fireEvent,
  getByLabelText,
  getByTestId,
  queryByTestId,
  render,
} from '@testing-library/react';
import { coles, netease, woolworths } from './mocks/data';

import { App } from './App';
import React from 'react';
import { search } from './api';

jest.mock('./api');

describe('app', () => {
  beforeEach(() => {
    search.mockImplementation(() => new Promise(() => undefined));
  });
  afterEach(async () => {
    search.mockReset();
    await cleanup();
  });
  it('shows list of countries', () => {
    const { container, unmount } = render(<App />);
    const select = getByLabelText(container, 'Market');
    expect(select.value).toBe('');
    expect(select.options[0].textContent).toBe('Global');
    expect(select.options[1].textContent).toBe('Argentina');
    expect(select.options[2].textContent).toBe('Australia');
    unmount();
  });
  it('shows sorting options', () => {
    const { container, unmount } = render(<App />);
    const select = getByLabelText(container, 'Sort by');
    expect(select.value).toBe('market_cap desc');
    expect(select.options[0].textContent).toBe('Market Cap Descending');
    expect(select.options[0].value).toBe('market_cap desc');
    expect(select.options[0].textContent).toBe('Market Cap Descending');
    expect(select.options[1].value).toBe('market_cap asc');
    expect(select.options[1].textContent).toBe('Market Cap Ascending');
    unmount();
  });
  it('shows loading', () => {
    const { container, unmount } = render(<App />);
    getByTestId(container, 'loading');
    unmount();
  });
});
describe('data returned', () => {
  beforeEach(() => {
    search.mockResolvedValue({
      data: [coles, woolworths],
      meta: { total_records: 100 },
    });
  });
  afterEach(() => {
    search.mockReset();
  });
  it('shows list of companies', async () => {
    const { container, unmount } = render(<App />);

    await findByText(container, 'Coles');
    await findByText(container, 'Woolworths');
    expect(search).toHaveBeenCalledWith(0, 24, 'market_cap', 'desc', '');

    unmount();
  });
  it('can filter by country', () => {
    const { container, unmount } = render(<App />);
    const select = getByLabelText(container, 'Market');
    fireEvent.change(select, { target: { value: 'au' } });

    expect(search).toHaveBeenCalledWith(0, 24, 'market_cap', 'desc', 'au');

    unmount();
  });
  it('can sort', async () => {
    const { container, unmount } = render(<App />);
    const select = getByLabelText(container, 'Sort by');
    await findByText(container, 'Coles');
    fireEvent.change(select, { target: { value: 'market_cap asc' } });

    expect(search).toHaveBeenCalledWith(0, 24, 'market_cap', 'asc', '');

    unmount();
  });
});
describe('load more', () => {
  beforeEach(() => {});
  afterEach(() => {
    search.mockReset();
  });
  it('loads more when scrolled to the bottom', async () => {
    search.mockResolvedValue({
      data: [coles, woolworths],
      meta: { total_records: 3 },
    });
    const { container, unmount } = render(<App />);
    await findByText(container, 'Coles');
    const main = container.querySelector('main');
    const companies = container.querySelector('.companies');
    jest.spyOn(main, 'clientHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(companies, 'clientHeight', 'get').mockImplementation(() => 500);
    search.mockResolvedValue({
      data: [netease],
      meta: { total_records: 3 },
    });
    fireEvent.scroll(main, { target: { scrollTop: 180 } });

    getByTestId(container, 'loading');
    expect(search).toHaveBeenCalledWith(2, 24, 'market_cap', 'desc', '');

    unmount();
  });

  it('does not loads more until the current request is completed', async () => {
    search.mockReturnValue(new Promise(() => undefined));
    const { container, unmount } = render(<App />);
    const main = container.querySelector('main');
    const companies = container.querySelector('.companies');
    jest.spyOn(main, 'clientHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(companies, 'clientHeight', 'get').mockImplementation(() => 500);
    fireEvent.scroll(main, { target: { scrollTop: 179 } });

    expect(search.mock.calls.length).toBe(1);

    unmount();
  });

  it('does not loads until scrolled to the bottom', async () => {
    search.mockResolvedValue({
      data: [coles, woolworths],
      meta: { total_records: 3 },
    });
    const { container, unmount } = render(<App />);
    await findByText(container, 'Coles');
    const main = container.querySelector('main');
    const companies = container.querySelector('.companies');
    jest.spyOn(main, 'clientHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(companies, 'clientHeight', 'get').mockImplementation(() => 500);
    fireEvent.scroll(main, { target: { scrollTop: 199 } });

    expect(queryByTestId(container, 'loading')).toBe(null);

    unmount();
  });

  it('does not loads if it is already last page', async () => {
    search.mockResolvedValue({
      data: [coles, woolworths],
      meta: { total_records: 3 },
    });
    const { container, unmount } = render(<App />);
    await findByText(container, 'Coles');
    search.mockResolvedValue({
      data: [netease],
      meta: { total_records: 3 },
    });
    const main = container.querySelector('main');
    const companies = container.querySelector('.companies');
    jest.spyOn(main, 'clientHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(companies, 'clientHeight', 'get').mockImplementation(() => 500);
    fireEvent.scroll(main, { target: { scrollTop: 200 } });
    await findByText(container, 'Netease');
    jest.spyOn(companies, 'clientHeight', 'get').mockImplementation(() => 600);
    fireEvent.scroll(main, { target: { scrollTop: 300 } });

    expect(queryByTestId(container, 'loading')).toBe(null);

    unmount();
  });
});
