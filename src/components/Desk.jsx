import { useRef, useState } from 'react';
import { layoutPrints } from '../lib/fresh.js';

const monthYear = (taken) => new Date(taken).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' });

// Loose prints on a desk. Drag one around; a click that does not drag opens it.
export default function Desk({ photos, onOpen }) {
  const spots = layoutPrints(photos);
  const deskRef = useRef(null);
  const drag = useRef(null);
  const [moved, setMoved] = useState({});
  const [stack, setStack] = useState(() => photos.map((_, i) => i));

  const raise = (i) => setStack((s) => [...s.filter((x) => x !== i), i]);

  function down(e, i) {
    drag.current = { i, x: e.clientX, y: e.clientY, base: { ...spots[i], ...(moved[i] || {}) }, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    raise(i);
  }
  function move(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    d.moved = true;
    const desk = deskRef.current?.getBoundingClientRect();
    if (!desk || !desk.width || !desk.height) return;
    setMoved((m) => ({ ...m, [d.i]: { left: d.base.left + (dx / desk.width) * 100, top: d.base.top + (dy / desk.height) * 100 } }));
  }
  function up() {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onOpen(photos[d.i]);
  }

  return (
    <div className="desk" ref={deskRef}>
      {photos.map((p, i) => {
        const spot = { ...spots[i], ...(moved[i] || {}) };
        return (
          <button
            key={p.name}
            type="button"
            className={'print' + (p.width >= p.height ? '' : ' portrait')}
            style={{ '--left': spot.left + '%', '--top': spot.top + '%', transform: 'rotate(' + spots[i].rotate + 'deg)', zIndex: stack.indexOf(i) + 1 }}
            onPointerDown={(e) => down(e, i)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => { drag.current = null; }}
            onClick={(e) => { if (e.detail === 0) onOpen(p); }}
          >
            <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" draggable="false" />
            {p.taken && <span className="print-date">{monthYear(p.taken)}</span>}
          </button>
        );
      })}
    </div>
  );
}
