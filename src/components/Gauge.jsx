import { describeHeight } from '../lib/heights.js';

const TOWER = 553; // the CN Tower, in metres
const TICKS = [[553, '553 m (CN Tower)'], [400, '400 m'], [200, '200 m'], [0, 'street level']];
const pct = (m) => 100 - (Math.min(TOWER, Math.max(0, m)) / TOWER) * 100;

// The pixel CN Tower. Drawn true to shape beside the page, or stretched into a slim strip.
function Tower({ stretch }) {
  return (
    <svg viewBox="0 0 40 240" preserveAspectRatio={stretch ? 'none' : 'xMaxYMid meet'} shapeRendering="crispEdges">
      <rect x="16" y="180" width="8" height="60" fill="#3a3a8e" /><rect x="14" y="214" width="12" height="26" fill="#3a3a8e" />
      <rect x="18" y="40" width="4" height="150" fill="#3a3a8e" />
      <rect x="8" y="84" width="24" height="14" fill="#3a3a8e" /><rect x="10" y="80" width="20" height="4" fill="#3a3a8e" />
      {[11, 15, 19, 23, 27].map((x) => <rect key={x} x={x} y="88" width="2" height="2" fill="#FFE26A" />)}
      <rect x="14" y="44" width="12" height="6" fill="#3a3a8e" />
      <rect x="19" y="2" width="2" height="42" fill="#3a3a8e" /><rect x="19" y="0" width="2" height="2" className="beacon" fill="#FF4444" />
    </svg>
  );
}

// Shows how high the photos in view were taken from, against the CN Tower.
// Wide screens get the tower beside the page with a scale; narrow screens get a
// slim strip down the right edge. Purely informational: it never takes a tap.
export default function Gauge({ height, slim = false }) {
  const known = height != null;
  const marker = (
    <div className={'gauge-marker' + (known ? '' : ' unknown')} style={{ top: (known ? pct(height) : 50) + '%' }}>
      <div className="gauge-label">{describeHeight(height)}</div>
    </div>
  );

  if (slim) {
    return (
      <div className="gauge-slim gauge-inert" aria-hidden="true">
        <Tower stretch />
        {marker}
      </div>
    );
  }
  return (
    <div className="gauge gauge-inert" aria-hidden="true">
      <Tower />
      {TICKS.map(([m, label]) => <div key={m} className="gauge-tick" style={{ top: pct(m) + '%' }}>{label}</div>)}
      {marker}
    </div>
  );
}
