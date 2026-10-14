// The newest photos, by the time they were taken; undated ones follow, newest file names first.
export function newest(photos, n) {
  const dated = photos.filter((p) => p.taken).sort((a, b) => (a.taken < b.taken ? 1 : a.taken > b.taken ? -1 : 0));
  const undated = photos.filter((p) => !p.taken).sort((a, b) => b.name.localeCompare(a.name));
  return [...dated, ...undated].slice(0, n);
}

function seed(name) {
  let h = 2166136261;
  for (const ch of name) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// A loose, repeatable scatter across the desk: percentages of the desk's width and height, and a tilt.
export function layoutPrints(photos) {
  return photos.map((p, i) => {
    const s = seed(p.name);
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      left: Math.min(68, col * 32 + (s % 7)),
      top: Math.min(55, row * 38 + ((s >>> 4) % 11)),
      rotate: ((s >>> 8) % 25) - 12,
    };
  });
}
