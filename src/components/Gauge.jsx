import { describeHeight } from '../lib/heights.js';

const TOP = 381; // the Empire State Building to the tip of its spire, in metres
const TICKS = [[381, '381 m', true], [300, '300 m'], [200, '200 m'], [100, '100 m'], [0, 'street level']];
const pct = (m) => 100 - (Math.min(TOP, Math.max(0, m)) / TOP) * 100;

// The building in an 80 x 240 grid (its broad face is about a third as wide as it is
// tall): y = 0 is the tip of the spire at 381 m, y = 240 is the street. Each tier is
// [left, right, top, bottom, floodlit]; the famous setbacks are at roughly the 6th, 21st,
// 30th, 72nd, 81st and 86th floors, and the mooring mast rises above the 86th.
const TIERS = [
  [0, 80, 224, 240, false],
  [7, 73, 186, 224, false],
  [13, 67, 168, 186, false],
  [20, 60, 70, 168, false],
  [24, 56, 51, 70, true],
  [28, 52, 38, 51, true],
];
const INK = {
  body: '#C9C2B2', shade: '#9A9282', edge: '#E2DCCD', terrace: '#6F6859', window: '#FFD86B', dark: '#7B7465',
  litBody: '#F2E6C8', litShade: '#CDBF9E', litWindow: '#FFF7DA',
  mast: '#E9EEF5', mastShade: '#B9C4D3', spire: '#F4F6FA', antenna: '#D0D4DA', beacon: '#FF4444',
  door: '#4A443A',
};

function Tier({ left, right, top, bottom, floodlit }) {
  const width = right - left;
  const shadeWidth = Math.max(2, Math.round(width / 4));
  const litRight = right - shadeWidth;
  const windows = [];
  for (let y = top + 3; y <= bottom - 3; y += 3) {
    for (let x = left + 2; x < litRight - 1; x += 3) {
      const dark = !floodlit && (x * 7 + y * 13) % 5 === 0;
      windows.push(<rect key={x + ',' + y} x={x} y={y} width="1" height="1" fill={dark ? INK.dark : floodlit ? INK.litWindow : INK.window} />);
    }
  }
  return (
    <g>
      <rect x={left} y={top} width={width} height={bottom - top} fill={floodlit ? INK.litBody : INK.body} />
      <rect x={litRight} y={top} width={shadeWidth} height={bottom - top} fill={floodlit ? INK.litShade : INK.shade} />
      <rect x={left} y={top} width={width} height="1" fill={INK.terrace} />
      <rect x={left} y={top + 1} width="1" height={bottom - top - 1} fill={INK.edge} />
      {windows}
    </g>
  );
}

function EmpireStateBuilding() {
  return (
    <svg viewBox="0 0 80 240" preserveAspectRatio="xMaxYMid meet" shapeRendering="crispEdges" overflow="visible">
      {TIERS.map(([left, right, top, bottom, floodlit]) => (
        <Tier key={top} left={left} right={right} top={top} bottom={bottom} floodlit={floodlit} />
      ))}
      {/* the crown and the mooring mast */}
      <rect x="30" y="31" width="20" height="7" fill={INK.litBody} /><rect x="45" y="31" width="5" height="7" fill={INK.litShade} />
      <rect x="32" y="29" width="16" height="2" fill={INK.litBody} /><rect x="44" y="29" width="4" height="2" fill={INK.litShade} />
      <rect x="35" y="13" width="10" height="16" fill={INK.mast} /><rect x="42" y="13" width="3" height="16" fill={INK.mastShade} />
      <rect x="37" y="18" width="1" height="1" fill={INK.window} /><rect x="39" y="18" width="1" height="1" fill={INK.window} />
      <rect x="37" y="22" width="1" height="1" fill={INK.window} /><rect x="39" y="22" width="1" height="1" fill={INK.window} />
      <rect x="37" y="4" width="6" height="9" fill={INK.mast} /><rect x="41" y="4" width="2" height="9" fill={INK.mastShade} />
      <rect x="39" y="0" width="2" height="4" fill={INK.spire} />
      {/* the broadcast antenna rises another 60 m above the scale */}
      <rect x="39.5" y="-36" width="1" height="36" fill={INK.antenna} />
      <rect x="39.5" y="-38" width="1" height="2" className="beacon" fill={INK.beacon} />
      {/* the entrance */}
      <rect x="36" y="233" width="8" height="7" fill={INK.door} /><rect x="38" y="235" width="4" height="5" fill={INK.window} />
    </svg>
  );
}

// Shows how high the photos in view were taken from. Wide screens get the Empire State
// Building beside the page, the marker at that height on it. Narrow screens get just the
// label on the right edge, placed by how far through the album the reader is, so it
// travels from the top of the screen to the bottom like a scrollbar. Purely
// informational: it never takes a tap, and it fades out when the album is not in view.
export default function Gauge({ height, slim = false, hidden = false, progress = 0 }) {
  const known = height != null;
  const top = slim ? progress * 100 : known ? pct(height) : 50;
  // "about 350 m up, 106th floor" breaks after the comma beside the building, where the label is narrow.
  const [first, ...rest] = describeHeight(height).split(', ');
  const marker = (
    <div className={'gauge-marker' + (known ? '' : ' unknown')} style={{ top: top + '%' }}>
      <div className="gauge-label">
        {first}
        {rest.length > 0 && <>,{' '}{!slim && <br />}{rest.join(', ')}</>}
      </div>
    </div>
  );
  const hiddenClass = hidden ? ' gauge-hidden' : '';

  if (slim) {
    return (
      <div className={'gauge-slim gauge-inert' + hiddenClass} aria-hidden="true">
        {marker}
      </div>
    );
  }
  return (
    <div className={'gauge gauge-inert' + hiddenClass} aria-hidden="true">
      <EmpireStateBuilding />
      {TICKS.map(([m, label, named]) => (
        <div key={m} className="gauge-tick" style={{ top: pct(m) + '%' }}>
          <span>
            {label}
            {named && <small>Empire State <br />Building</small>}
          </span>
        </div>
      ))}
      {marker}
    </div>
  );
}
