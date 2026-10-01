import { useEffect, useRef } from 'react';

// A little photo window, like it is 1998: title bar, the photo, Prev/Next, and a
// link to the full-size file. Arrow keys and swiping also step through the set.
export default function PhotoViewer({ photos, index, onChange, onClose }) {
  const closeRef = useRef(null);
  const touchX = useRef(null);
  const count = photos.length;
  const photo = photos[index];
  const step = (delta) => onChange((index + delta + count) % count);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const original = document.title;
    document.title = 'Photo ' + (index + 1) + ' of ' + count + ' - ' + original;
    return () => { document.title = original; };
  }, [index, count]);

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="win">
        <div className="win-title win-chrome">
          <span>Photo {index + 1} of {count}</span>
          <button ref={closeRef} className="win-x" type="button" aria-label="Close" onClick={onClose}>
            &#10005;
          </button>
        </div>
        <div className="win-body">
          <img key={photo.src} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        </div>
        <div className="win-status win-chrome">
          <span>
            [ <button className="linkish" type="button" onClick={() => step(-1)}>&lt;&lt; Prev</button>
            {' | '}
            <button className="linkish" type="button" onClick={() => step(1)}>Next &gt;&gt;</button> ]
          </span>
          <a href={photo.src} target="_blank" rel="noopener noreferrer">
            full size ({photo.width} x {photo.height})
          </a>
        </div>
      </div>
    </div>
  );
}
