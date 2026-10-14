import { describe, it, expect } from 'vitest';
import { julian, localSiderealTime, altAz, sunAltitude, moonPhase, project } from './sky.js';

const TORONTO = { lat: 43.6532, lon: -79.3832 };
const POLARIS = { ra: 37.95, dec: 89.26 };

describe('sky math for Toronto', () => {
  it('keeps Polaris at an altitude equal to the latitude, at any time of year', () => {
    for (const iso of ['2026-01-15T03:00:00Z', '2026-07-04T08:00:00Z', '2026-10-14T23:30:00Z']) {
      const jd = julian(new Date(iso));
      const { alt } = altAz(POLARIS.ra, POLARIS.dec, localSiderealTime(jd, TORONTO.lon), TORONTO.lat);
      expect(Math.abs(alt - TORONTO.lat)).toBeLessThan(1.5);
    }
  });

  it('puts the sun below the horizon at midnight and above it at midday', () => {
    expect(sunAltitude(julian(new Date('2026-01-15T05:00:00Z')), TORONTO)).toBeLessThan(-30);
    expect(sunAltitude(julian(new Date('2026-06-21T17:00:00Z')), TORONTO)).toBeGreaterThan(60);
  });

  it('knows the new moon of 6 January 2000 and the full moon of 21 January 2000', () => {
    expect(moonPhase(julian(new Date('2000-01-06T18:14:00Z'))).fraction).toBeLessThan(0.03);
    expect(moonPhase(julian(new Date('2000-01-21T04:40:00Z'))).fraction).toBeGreaterThan(0.97);
  });

  it('projects the zenith to the centre and the horizon to the edge', () => {
    expect(project(90, 123, { cx: 100, cy: 50, R: 40 })).toEqual({ x: 100, y: 50 });
    const north = project(0, 0, { cx: 100, cy: 50, R: 40 });
    expect(north.x).toBeCloseTo(100);
    expect(north.y).toBeCloseTo(10);
  });
});
