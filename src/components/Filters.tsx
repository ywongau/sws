import './Filters.css'

import React from 'react';
import { markets } from '../constants';

const marketEntries = Object.entries(markets);

export const Filters = ({ onMarketChanged, onSortingChanged }) => (
  <ul className="filters">
    <li>
      <label>
        <span>Market</span>
        <select onChange={onMarketChanged}>
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
        <select onChange={onSortingChanged}>
          <option value="market_cap desc">Market Cap Descending</option>
          <option value="market_cap asc">Market Cap Ascending</option>
        </select>
      </label>
    </li>
  </ul>
);
