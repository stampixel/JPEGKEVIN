import { useEffect, useRef } from 'react';

// A little photo window, like it is 1998: title bar, the photo, Prev/Next, and a
// link to the full-size file. Arrow keys and swiping also step through the set.
export default function PhotoViewer({ photos, index, onChange, onClose, onPostcard, subtitle, inert = false }) {
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const count = photos.length;
  const photo = photos[index];
  const step = (delta) => onChange((index + delta + count) % count);
  const title = 'Photo ' + (index + 1) + ' of ' + count + (subtitle?.(photo) ? ', ' + subtitle(photo) : '');

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const original = document.title;
    document.title = title + ' - ' + original;
    return () => { document.title = original; };
  }, [title]);

  useEffect(() => {
    const onKey = (e) => {
      if (inert) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    [index + 1, index - 1].forEach((i) => {
      new Image().src = photos[(i + count) % count].src;
    });
  }, [index, photos, count]);

  const onTouchStart = (e) => { touchX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };

  return (
    <div
      className="win-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      inert={inert}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="win">
        <div className="win-title">
          <button ref={closeRef} className="win-x" type="button" aria-label="Close" onClick={onClose} />
          <span>{title}</span>
        </div>
        <div className="win-body">
          <img key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        </div>
        <div className="win-status">
          <span className="btn-row">
            <button className="btn" type="button" onClick={() => step(-1)}>Prev</button>
            <button className="btn" type="button" onClick={() => step(1)}>Next</button>
          </span>
          <span className="win-extra">
            {onPostcard && <button className="btn" type="button" onClick={() => onPostcard(photo)}>Send as postcard</button>}
          </span>
          <a href={photo.src} target="_blank" rel="noopener noreferrer">
            Full size <span className="win-dims">({photo.width} x {photo.height})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
