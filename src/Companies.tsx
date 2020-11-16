import React from 'react';

export const Companies = ({ companies, className }) => {
  return (
    <ul className={className}>
      {companies.map((x) => (
        <li
          key={x.id}
          style={{ backgroundImage: `url(${x.info.data.main_thumb})` }}>
          <article>
            <h1>{x.name}</h1>
            <h2>{x.unique_symbol}</h2>
            <dl>
              <dt>Value</dt>
              <dd>{x.score.data.value}</dd>
              <dt>Future</dt>
              <dd>{x.score.data.future}</dd>
              <dt>Past</dt>
              <dd>{x.score.data.past}</dd>
              <dt>Health</dt>
              <dd>{x.score.data.health}</dd>
              <dt>Income</dt>
              <dd>{x.score.data.income}</dd>
            </dl>
          </article>
        </li>
      ))}
    </ul>
  );
};
