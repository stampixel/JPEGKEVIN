import { packRows } from '../lib/rows.js';

// The row is labelled with its highest photo, so a page sorted by height reads top-down.
const rowHeight = (row) => {
  const known = row.filter((p) => p.altitude != null).map((p) => p.altitude);
  return known.length ? Math.round(Math.max(...known)) : '';
};

// Rows of photos in bevelled cells, the way a 1998 photo album page had them, in the
// exact order given. Each photo is a plain link to its file; with script running, it opens the viewer.
export default function Album({ photos, narrow = false, onOpen }) {
  const indexOf = new Map(photos.map((photo, i) => [photo, i]));

  return (
    <div className="album">
      {packRows(photos, { narrow }).map((row) => (
        <div className="row" key={row[0].name} data-height={rowHeight(row)}>
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
