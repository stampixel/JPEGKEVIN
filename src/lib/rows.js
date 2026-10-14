// Packs photos into album rows without ever changing their order: each row takes the next
// photos in sequence until their widths add up to a row. Wide screens hold two landscapes,
// three portraits, or a mix such as a landscape and a portrait; narrow screens hold one
// landscape or two portraits. Whatever is left at the end becomes a shorter final row.
const TARGET = { wide: 2.0, narrow: 1.2 }; // in landscape-widths (a 3:2 photo is 1.5, a 2:3 is 0.667)

export function packRows(photos, { narrow = false } = {}) {
  const target = narrow ? TARGET.narrow : TARGET.wide;
  const rows = [];
  let row = [];
  let width = 0;
  for (const photo of photos) {
    row.push(photo);
    width += photo.width / photo.height;
    if (width >= target - 1e-9) {
      rows.push(row);
      row = [];
      width = 0;
    }
  }
  if (row.length) rows.push(row);
  return rows;
}
