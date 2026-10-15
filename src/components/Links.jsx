import { Fragment } from 'react';
import { LINKS } from '../links.js';

// One plain sentence naming the places, no logos; each name opens the profile in a new tab.
export default function Links() {
  const last = LINKS.length - 1;
  return (
    <p>
      Elsewhere:{' '}
      {LINKS.map(([name, href], i) => (
        <Fragment key={name}>
          {i > 0 && (i === last ? ' and ' : ', ')}
          <a href={href} target="_blank" rel="noopener noreferrer">{name}</a>
        </Fragment>
      ))}
      .
    </p>
  );
}
