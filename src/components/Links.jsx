import { Fragment } from 'react';
import { LINKS } from '../links.js';

// One plain sentence naming the places, no logos; each name is an ordinary link to the profile.
export default function Links() {
  const last = LINKS.length - 1;
  return (
    <p>
      Elsewhere:{' '}
      {LINKS.map(([name, href], i) => (
        <Fragment key={name}>
          {i > 0 && (i === last ? ', and ' : ', ')}
          <a href={href}>{name}</a>
        </Fragment>
      ))}
      .
    </p>
  );
}
