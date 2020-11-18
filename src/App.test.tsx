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
import { coles, netease, woolworths } from '../mocks/data';

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
  const loadMoreThreshold = 100;
  const fakeHeight = (element, height) =>
    jest.spyOn(element, 'clientHeight', 'get').mockImplementation(() => height);
  const fakeScroll = (element, scrollTop) =>
    fireEvent.scroll(element, { target: { scrollTop } });

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
    search.mockResolvedValue({
      data: [netease],
      meta: { total_records: 3 },
    });
    fakeHeight(main, 300);
    fakeHeight(companies, 500);
    fakeScroll(main, 500 - 300 - loadMoreThreshold);

    getByTestId(container, 'loading');
    expect(search).toHaveBeenCalledWith(2, 24, 'market_cap', 'desc', '');

    unmount();
  });

  it('does not loads more until the current request is completed', async () => {
    search.mockReturnValue(new Promise(() => undefined));
    const { container, unmount } = render(<App />);
    const main = container.querySelector('main');
    const companies = container.querySelector('.companies');
    fakeHeight(main, 300);
    fakeHeight(companies, 500);
    fakeScroll(main, 500 - 300);

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
    fakeHeight(main, 300);
    fakeHeight(companies, 500);
    fakeScroll(main, 500 - 300 - loadMoreThreshold - 1);

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
    fakeHeight(main, 300);
    fakeHeight(companies, 500);
    fakeScroll(main, 500 - 300 - loadMoreThreshold);
    await findByText(container, 'Netease');
    fakeHeight(companies, 600);
    fakeScroll(main, 600 - 300);

    expect(queryByTestId(container, 'loading')).toBe(null);

    unmount();
  });
});
