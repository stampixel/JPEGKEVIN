import { Fragment } from 'react';
import { LINKS } from '../links.js';

// One plain sentence naming the places, no logos; each name is an ordinary link to the profile.
// The list in links.js can be any length: a pair reads "A and B", longer lists take the serial comma.
export default function Links() {
  if (LINKS.length === 0) return null;
  const last = LINKS.length - 1;
  const before = (i) => (i === 0 ? '' : i === last ? (last === 1 ? ' and ' : ', and ') : ', ');
  return (
    <p>
      Elsewhere:{' '}
      {LINKS.map(([name, href], i) => (
        <Fragment key={href}>
          {before(i)}
          <a href={href}>{name}</a>
        </Fragment>
      ))}
      .
    </p>
  );
}
