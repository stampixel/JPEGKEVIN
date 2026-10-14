import { describe, it, expect } from 'vitest';
import { newest, layoutPrints } from './fresh.js';

const p = (name, taken) => ({ name, taken, width: 2048, height: 1365 });

describe('newest', () => {
  it('returns the most recently taken photos first', () => {
    const photos = [p('a.jpg', '2026-01-01T00:00:00'), p('b.jpg', '2026-10-01T00:00:00'), p('c.jpg', '2026-05-01T00:00:00')];
    expect(newest(photos, 2).map((x) => x.name)).toEqual(['b.jpg', 'c.jpg']);
  });

  it('puts photos without a date after dated ones, newest file names first', () => {
    const photos = [p('DSC09.jpg', null), p('DSC01.jpg', null), p('b.jpg', '2026-10-01T00:00:00')];
    expect(newest(photos, 3).map((x) => x.name)).toEqual(['b.jpg', 'DSC09.jpg', 'DSC01.jpg']);
  });
});

describe('layoutPrints', () => {
  it('gives every print a position inside the desk and a small tilt, deterministically', () => {
    const photos = [p('a.jpg'), p('b.jpg'), p('c.jpg', null), p('d.jpg'), p('e.jpg'), p('f.jpg')];
    const once = layoutPrints(photos);
    const twice = layoutPrints(photos);
    expect(once).toEqual(twice);
    expect(once).toHaveLength(6);
    for (const spot of once) {
      expect(spot.left).toBeGreaterThanOrEqual(0);
      expect(spot.left).toBeLessThanOrEqual(68);
      expect(spot.top).toBeGreaterThanOrEqual(0);
      expect(spot.top).toBeLessThanOrEqual(55);
      expect(Math.abs(spot.rotate)).toBeLessThanOrEqual(12);
    }
  });
});
