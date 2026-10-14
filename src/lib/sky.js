// Where things are in the sky, with low-precision formulas (good to about a degree).
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const norm = (d) => ((d % 360) + 360) % 360;

export function julian(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function localSiderealTime(jd, lon) {
  return norm(280.46061837 + 360.98564736629 * (jd - 2451545) + lon);
}

// Altitude and azimuth (degrees, azimuth from north through east) of a point at ra/dec (degrees).
export function altAz(ra, dec, lst, lat) {
  const H = rad(norm(lst - ra));
  const d = rad(dec);
  const phi = rad(lat);
  const alt = Math.asin(Math.sin(d) * Math.sin(phi) + Math.cos(d) * Math.cos(phi) * Math.cos(H));
  const az = Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(phi) - Math.cos(d) * Math.cos(H) * Math.sin(phi));
  return { alt: deg(alt), az: norm(deg(az)) };
}

export function sunEcliptic(jd) {
  const n = jd - 2451545;
  const g = rad(norm(357.528 + 0.9856003 * n));
  return norm(280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g));
}

export function moonEcliptic(jd) {
  const n = jd - 2451545;
  const Lp = norm(218.316 + 13.176396 * n);
  const M = rad(norm(357.529 + 0.98560028 * n));
  const Mp = rad(norm(134.963 + 13.064993 * n));
  const D = rad(norm(297.85 + 12.190749 * n));
  const F = rad(norm(93.272 + 13.22935 * n));
  const lon = norm(
    Lp + 6.289 * Math.sin(Mp) - 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D) - 0.214 * Math.sin(2 * Mp)
      - 0.186 * Math.sin(M) - 0.114 * Math.sin(2 * F) - 0.059 * Math.sin(2 * D - 2 * Mp) - 0.057 * Math.sin(2 * D - M - Mp)
      + 0.053 * Math.sin(2 * D + Mp) + 0.046 * Math.sin(2 * D - M) - 0.041 * Math.sin(M - Mp) - 0.035 * Math.sin(D) - 0.031 * Math.sin(M + Mp),
  );
  const lat = 5.128 * Math.sin(F) + 0.28 * Math.sin(Mp + F) + 0.277 * Math.sin(Mp - F) + 0.173 * Math.sin(2 * D - F);
  return { lon, lat };
}

export function eclipticToEquatorial(lon, lat, jd) {
  const e = rad(23.4393 - 0.0000004 * (jd - 2451545));
  const l = rad(lon);
  const b = rad(lat);
  const ra = deg(Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)));
  const dec = deg(Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)));
  return { ra: norm(ra), dec };
}

export function sunAltitude(jd, { lat, lon }) {
  const eq = eclipticToEquatorial(sunEcliptic(jd), 0, jd);
  return altAz(eq.ra, eq.dec, localSiderealTime(jd, lon), lat).alt;
}

export function moonPosition(jd, { lat, lon }) {
  const m = moonEcliptic(jd);
  const eq = eclipticToEquatorial(m.lon, m.lat, jd);
  return altAz(eq.ra, eq.dec, localSiderealTime(jd, lon), lat);
}

// Illuminated fraction (0 new, 1 full) and whether the moon is waxing.
export function moonPhase(jd) {
  const elongation = norm(moonEcliptic(jd).lon - sunEcliptic(jd));
  const e = rad(elongation);
  return { fraction: (1 - Math.cos(e)) / 2, waxing: Math.sin(e) > 0, elongation };
}

// Looking straight up: the zenith at the centre, the horizon at radius R, north at the top, east on the left.
export function project(alt, az, { cx, cy, R }) {
  const r = (R * (90 - alt)) / 90;
  const a = rad(az);
  return { x: cx - r * Math.sin(a), y: cy - r * Math.cos(a) };
}
