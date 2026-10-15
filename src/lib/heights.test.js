import { describe, it, expect } from 'vitest';
import { orderByHeight, describeHeight, nearestRow, trackGauge } from './heights.js';

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

describe('trackGauge', () => {
  // The reading line sits 45% down an 800px screen, at 360px.
  it('stays hidden until the album reaches the reading line', () => {
    const rows = [{ top: 700, bottom: 900, value: 350 }];
    expect(trackGauge({ rows, albumTop: 700, albumBottom: 2000, viewportHeight: 800 })).toEqual({ visible: false, height: 350, progress: 0 });
  });

  it('shows the row on the line and how far through the album it is', () => {
    const rows = [{ top: 100, bottom: 300, value: 350 }, { top: 320, bottom: 500, value: 200 }];
    expect(trackGauge({ rows, albumTop: 100, albumBottom: 1100, viewportHeight: 800 })).toEqual({ visible: true, height: 200, progress: 0.26 });
  });

  it('hides as soon as the footer comes on screen, so the label never sits on the footer or caption', () => {
    const rows = [{ top: 100, bottom: 600, value: 0 }];
    expect(trackGauge({ rows, albumTop: -2000, albumBottom: 600, footerTop: 700, viewportHeight: 800 }).visible).toBe(false);
    expect(trackGauge({ rows, albumTop: -2000, albumBottom: 600, footerTop: 900, viewportHeight: 800 }).visible).toBe(true);
  });

  it('hides again once the whole album has scrolled past the line', () => {
    const rows = [{ top: -900, bottom: -700, value: 0 }];
    expect(trackGauge({ rows, albumTop: -3000, albumBottom: -700, viewportHeight: 800 })).toEqual({ visible: false, height: 0, progress: 1 });
  });
});
