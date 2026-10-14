import { describe, it, expect } from 'vitest';
import { orderByHeight, describeHeight, nearestRow } from './heights.js';

const p = (name, altitude) => ({ name, altitude });

describe('orderByHeight', () => {
  it('sorts known heights from highest to lowest and keeps unknown ones after, in their given order', () => {
    const photos = [p('low', 20), p('u1', null), p('high', 300), p('u2', null), p('mid', 150)];
    expect(orderByHeight(photos).map((x) => x.name)).toEqual(['high', 'mid', 'low', 'u1', 'u2']);
  });
});

describe('describeHeight', () => {
  it('describes the ground, a height with its floor, and the unknown', () => {
    expect(describeHeight(4)).toBe('street level');
    expect(describeHeight(180)).toBe('about 180 m up, 55th floor');
    expect(describeHeight(10)).toBe('about 10 m up, 3rd floor');
    expect(describeHeight(null)).toBe('height not noted yet');
  });
});

describe('nearestRow', () => {
  it('prefers the row that spans the line, otherwise the closest edge', () => {
    const rows = [
      { top: 0, bottom: 100, value: 'a' },
      { top: 120, bottom: 300, value: 'b' },
      { top: 320, bottom: 400, value: 'c' },
    ];
    expect(nearestRow(rows, 200)).toBe('b');
    expect(nearestRow(rows, 110)).toBe('a');
    expect(nearestRow(rows, 312)).toBe('c');
    expect(nearestRow([], 50)).toBeUndefined();
  });
});
