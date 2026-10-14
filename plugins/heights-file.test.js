import { describe, it, expect } from 'vitest';
import { parseHeights, serializeHeights, withValue } from './heights-file.js';

const SOURCE = `// How high above the street each photo was taken from, in metres.
export const HEIGHTS = {
  'DSC04050.jpg': 180, // guess
  'NKP05250 2.jpg': null,
  'SONY ILCE-6100 6048x4024_002148.jpg': 220, // guess
  'DSC00027.jpg': 0,
};
`;

describe('parseHeights', () => {
  it('reads every entry with its value and whether it is still a guess', () => {
    expect(parseHeights(SOURCE)).toEqual([
      { name: 'DSC04050.jpg', value: 180, guess: true },
      { name: 'NKP05250 2.jpg', value: null, guess: false },
      { name: 'SONY ILCE-6100 6048x4024_002148.jpg', value: 220, guess: true },
      { name: 'DSC00027.jpg', value: 0, guess: false },
    ]);
  });
});

describe('serializeHeights', () => {
  it('writes a file that parses back to the same entries', () => {
    const entries = parseHeights(SOURCE);
    expect(parseHeights(serializeHeights(entries))).toEqual(entries);
    expect(serializeHeights(entries)).toContain("export const HEIGHTS = {");
  });
});

describe('withValue', () => {
  it('sets a value and clears the guess mark', () => {
    const entries = withValue(parseHeights(SOURCE), 'DSC04050.jpg', 195);
    expect(entries.find((e) => e.name === 'DSC04050.jpg')).toEqual({ name: 'DSC04050.jpg', value: 195, guess: false });
  });
  it('clears a value back to unknown', () => {
    const entries = withValue(parseHeights(SOURCE), 'DSC00027.jpg', null);
    expect(entries.find((e) => e.name === 'DSC00027.jpg')).toEqual({ name: 'DSC00027.jpg', value: null, guess: false });
  });
  it('adds a photo that was not in the file yet', () => {
    const entries = withValue(parseHeights(SOURCE), 'NEW.jpg', 42);
    expect(entries.at(-1)).toEqual({ name: 'NEW.jpg', value: 42, guess: false });
  });
});
