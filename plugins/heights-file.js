// Reads and writes src/heights.js, the hand-kept list of how high each photo was taken from.
const HEADER = `// How high above the street each photo was taken from, in metres.
// This drives the album order (highest first) and the CN Tower gauge. A photo with null is
// placed after the ones with a height and the gauge says "height not noted yet" for it.
// Edit by hand, or run the dev server and open /__labels. Entries marked "guess" were first
// estimated from the photo; Kevin reviewed the whole list on 2026-10-14.
`;
const LINE = /^\s*(['"])(.*?)\1\s*:\s*(null|-?\d+(?:\.\d+)?)\s*,?\s*(\/\/\s*guess)?\s*$/;

export function parseHeights(source) {
  const entries = [];
  for (const line of source.split('\n')) {
    const m = LINE.exec(line);
    if (!m) continue;
    entries.push({ name: m[2], value: m[3] === 'null' ? null : Number(m[3]), guess: Boolean(m[4]) });
  }
  return entries;
}

const quote = (name) => (name.includes("'") ? JSON.stringify(name) : "'" + name + "'");

export function serializeHeights(entries) {
  const lines = entries.map((e) => '  ' + quote(e.name) + ': ' + (e.value == null ? 'null' : e.value) + ',' + (e.guess ? ' // guess' : ''));
  return HEADER + 'export const HEIGHTS = {\n' + lines.join('\n') + '\n};\n';
}

export function withValue(entries, name, value) {
  const next = entries.map((e) => (e.name === name ? { name, value, guess: false } : e));
  if (!next.some((e) => e.name === name)) next.push({ name, value, guess: false });
  return next;
}
