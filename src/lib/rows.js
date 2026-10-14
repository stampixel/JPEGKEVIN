// Groups photos into album rows without ever mixing orientations.
// Wide screens: two landscapes or three portraits per row.
// Narrow screens: one landscape or two portraits per row.
// Rows are ordered by where their first photo sits in the input, so a row that
// takes a while to fill still appears near where it began; whatever is left over
// at the end becomes a shorter row in the same place.
export function groupRows(photos, { narrow = false } = {}) {
  const capacity = narrow ? { landscape: 1, portrait: 2 } : { landscape: 2, portrait: 3 };
  const rows = [];
  const open = { landscape: null, portrait: null };

  photos.forEach((photo, index) => {
    const kind = photo.width >= photo.height ? 'landscape' : 'portrait';
    const row = open[kind] ?? (open[kind] = { start: index, photos: [] });
    row.photos.push(photo);
    if (row.photos.length === capacity[kind]) {
      rows.push(row);
      open[kind] = null;
    }
  });
  rows.push(...Object.values(open).filter(Boolean));

  return rows.sort((a, b) => a.start - b.start).map((row) => row.photos);
}
