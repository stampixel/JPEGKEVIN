import { groupRows } from '../lib/rows.js';

// Rows of photos in bevelled cells, the way a 1998 photo album page had them.
// Each photo is a plain link to its file; with script running, it opens the viewer instead.
export default function Album({ photos, narrow = false, onOpen }) {
  const indexOf = new Map(photos.map((photo, i) => [photo, i]));

  return (
    <div className="album">
      {groupRows(photos, { narrow }).map((row) => (
        <div className="row" key={row[0].name}>
          {row.map((photo) => (
            <a
              key={photo.name}
              className={'cell ' + (photo.width >= photo.height ? 'landscape' : 'portrait')}
              href={photo.src}
              style={{ '--ar': (photo.width / photo.height).toFixed(4) }}
              onClick={(e) => { e.preventDefault(); onOpen(indexOf.get(photo)); }}
            >
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}
