import { describe, it, expect } from 'vitest';
import { wrapLines, postmarkLines } from './postcard.js';

const measure = (s) => s.length * 10;

describe('wrapLines', () => {
  it('breaks text into lines no wider than the limit, keeping words whole', () => {
    expect(wrapLines(measure, 'made it to the roof tonight', 110)).toEqual(['made it to', 'the roof', 'tonight']);
  });
  it('keeps a single overlong word on its own line', () => {
    expect(wrapLines(measure, 'supercalifragilistic ok', 50)).toEqual(['supercalifragilistic', 'ok']);
  });
});

describe('postmarkLines', () => {
  it('stamps the place, the date and the time', () => {
    const lines = postmarkLines(new Date(2026, 9, 2, 14, 15), 'TORONTO ON');
    expect(lines).toEqual(['TORONTO ON', 'OCT 02 2026', '2:15 PM']);
  });
});
