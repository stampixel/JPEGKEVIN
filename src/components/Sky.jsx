import { useEffect, useRef, useState } from 'react';
import { STARS, LINES, NAMES } from '../sky-data.js';
import { julian, localSiderealTime, altAz, project, sunAltitude, moonPosition, moonPhase } from '../lib/sky.js';

const TORONTO = { lat: 43.6532, lon: -79.3832 };
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=43.65&longitude=-79.38&current=temperature_2m,weather_code&timezone=America%2FToronto';
const WMO = { 0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog', 48: 'fog', 51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 61: 'rain', 63: 'rain', 65: 'heavy rain', 71: 'snow', 73: 'snow', 75: 'heavy snow', 80: 'showers', 81: 'showers', 82: 'showers', 95: 'thunderstorm' };
const FAMOUS = new Set(['Orion', 'Big Dipper', 'Cassiopeia', 'Scorpius', 'Leo', 'Cygnus', 'Pegasus', 'Taurus']);
const starColor = (bv) => (bv < 0 ? '#cfe3ff' : bv < 0.4 ? '#e9f0ff' : bv < 0.8 ? '#fff8e8' : bv < 1.4 ? '#ffe4b8' : '#ffc9a3');
const starSize = (mag) => (mag <= 0 ? 2.7 : mag <= 1 ? 2.3 : mag <= 2 ? 1.9 : mag <= 3 ? 1.5 : mag <= 4 ? 1.1 : 0.8);

function drawSky(canvas, now) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return {};
  const W = (canvas.width = window.innerWidth);
  const H = (canvas.height = window.innerHeight);
  const view = { cx: W / 2, cy: H / 2, R: (Math.hypot(W, H) / 2) * 1.08 };
  const jd = julian(now);
  const lst = localSiderealTime(jd, TORONTO.lon);
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(150,150,230,0.16)';
  ctx.lineWidth = 1;
  for (const segment of LINES) {
    let prev = null;
    for (const [ra, dec] of segment) {
      const p = altAz(ra, dec, lst, TORONTO.lat);
      const pt = p.alt > -1 ? project(p.alt, p.az, view) : null;
      if (prev && pt && Math.hypot(pt.x - prev.x, pt.y - prev.y) < view.R * 0.6) {
        ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
      }
      prev = pt;
    }
  }
  for (const [ra, dec, mag, bv] of STARS) {
    const p = altAz(ra, dec, lst, TORONTO.lat);
    if (p.alt < -0.5) continue;
    const pt = project(p.alt, p.az, view);
    ctx.globalAlpha = Math.min(1, 0.45 + (5 - mag) * 0.14) * Math.min(1, (p.alt + 2) / 12);
    ctx.fillStyle = starColor(bv);
    ctx.beginPath(); ctx.arc(pt.x, pt.y, starSize(mag), 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(175,175,235,0.45)';
  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = 'center';
  for (const [ra, dec, name] of NAMES) {
    if (!FAMOUS.has(name)) continue;
    const p = altAz(ra, dec, lst, TORONTO.lat);
    if (p.alt < 8) continue;
    const pt = project(p.alt, p.az, view);
    ctx.fillText(name, pt.x, pt.y);
  }

  const moon = moonPosition(jd, TORONTO);
  const phase = moonPhase(jd);
  if (moon.alt > -1) {
    const pt = project(moon.alt, moon.az, view);
    const r = 8;
    ctx.save();
    ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#f3efd8'; ctx.fillRect(pt.x - r, pt.y - r, 2 * r, 2 * r);
    ctx.fillStyle = '#0a0a3a'; ctx.fillRect(phase.waxing ? pt.x - r : pt.x, pt.y - r, r, 2 * r);
    ctx.fillStyle = phase.fraction > 0.5 ? '#f3efd8' : '#0a0a3a';
    ctx.beginPath(); ctx.ellipse(pt.x, pt.y, Math.max(0.5, r * Math.abs(Math.cos((phase.elongation * Math.PI) / 180))), r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(175,175,235,0.7)';
    ctx.fillText('moon', pt.x, pt.y + r + 13);
  }
  return { daylight: sunAltitude(jd, TORONTO) > -6, moonUp: moon.alt > 0, moonLit: Math.round(phase.fraction * 100) };
}

// The actual sky over Toronto right now, drawn behind the page, with a line about it in the corner.
export default function Sky() {
  const canvasRef = useRef(null);
  const [weather, setWeather] = useState('');
  const [state, setState] = useState({});
  const [time, setTime] = useState('');

  useEffect(() => {
    let timer;
    const draw = () => {
      const now = new Date();
      setState(drawSky(canvasRef.current, now));
      setTime(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', hour: 'numeric', minute: '2-digit' }).format(now));
    };
    draw();
    window.addEventListener('resize', draw);
    timer = setInterval(draw, 60000);
    fetch(WEATHER_URL)
      .then((r) => r.json())
      .then((j) => {
        const c = j.current;
        setWeather((WMO[c.weather_code] || 'cloudy') + ', ' + Math.round(c.temperature_2m) + '°C');
      })
      .catch(() => {});
    return () => { window.removeEventListener('resize', draw); clearInterval(timer); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="sky" aria-hidden="true" />
      <div className="sky-caption">
        {state.daylight ? 'the sky over Toronto right now, behind the daylight' : 'the sky over Toronto right now'}
        <br />
        {time}{weather && ', ' + weather}{state.moonUp && ', moon ' + state.moonLit + '% lit'}
      </div>
    </>
  );
}
