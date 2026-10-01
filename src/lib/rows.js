// Groups photos into album rows without ever mixing orientations.
// Wide screens: two landscapes or three portraits per row.
// Narrow screens: one landscape or two portraits per row.
// A row is emitted as soon as it fills, so the album follows the input order;
// whatever is left over at the end becomes a shorter final row.
export function groupRows(photos, { narrow = false } = {}) {
  const capacity = narrow ? { landscape: 1, portrait: 2 } : { landscape: 2, portrait: 3 };
  const rows = [];
  const open = { landscape: null, portrait: null };

  photos.forEach((photo, index) => {
    const kind = photo.width >= photo.height ? 'landscape' : 'portrait';
    const row = open[kind] ?? (open[kind] = { start: index, photos: [] });
    row.photos.push(photo);
    if (row.photos.length === capacity[kind]) {
      rows.push(row.photos);
      open[kind] = null;
    }
  });

  Object.values(open)
    .filter(Boolean)
    .sort((a, b) => a.start - b.start)
    .forEach((row) => rows.push(row.photos));

  return rows;
}
