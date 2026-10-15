// Photos with a known altitude (metres above the street) first, highest to lowest; the rest keep their order.
export function orderByHeight(photos) {
  const known = photos.filter((p) => p.altitude != null).sort((a, b) => b.altitude - a.altitude);
  return [...known, ...photos.filter((p) => p.altitude == null)];
}

const ordinal = (n) => {
  const r = n % 100;
  if (r >= 11 && r <= 13) return n + 'th';
  return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th');
};

export function describeHeight(m) {
  if (m == null) return 'height not noted yet';
  if (m < 6) return 'street level';
  return 'about ' + Math.round(m) + ' m up, ' + ordinal(Math.max(1, Math.round(m / 3.3))) + ' floor';
}

// The row that spans the line at y, or the one whose edge is closest to it.
export function nearestRow(rows, y) {
  let best;
  let bestDistance = Infinity;
  for (const row of rows) {
    const d = row.top <= y && row.bottom >= y ? 0 : Math.min(Math.abs(row.top - y), Math.abs(row.bottom - y));
    if (d < bestDistance) {
      bestDistance = d;
      best = row;
    }
  }
  return best?.value;
}

// What the gauge should show for the current scroll position. The reading line sits
// 45% down the screen; the gauge is visible while the album spans it, reads the row on
// it, and reports how far through the album that line is (0 at the top, 1 at the end).
export function trackGauge({ rows, albumTop, albumBottom, viewportHeight }) {
  const line = viewportHeight * 0.45;
  const visible = albumTop <= line && albumBottom >= line;
  const span = Math.max(1, albumBottom - albumTop);
  const progress = Math.min(1, Math.max(0, (line - albumTop) / span));
  return { visible, height: nearestRow(rows, line) ?? null, progress: Math.round(progress * 100) / 100 };
}
