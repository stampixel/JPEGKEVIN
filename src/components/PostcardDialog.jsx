import { useEffect, useRef, useState } from 'react';
import { CARD, drawBack, drawFront } from '../lib/postcard.js';

const RIBBON = 'Greetings from up here';
const PLACE = 'TORONTO ON';
const CREDIT = 'a photo by Kevin Tang, jpegkevin.com';

function canShareFiles() {
  try {
    return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [new File([], 'postcard.png', { type: 'image/png' })] });
  } catch {
    return false;
  }
}

// A 1998 postcard made from one photo: click to flip it, write a note, download or share it.
export default function PostcardDialog({ photo, onClose }) {
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const closeRef = useRef(null);
  const [flipped, setFlipped] = useState(false);
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [stamp, setStamp] = useState(null);
  const [shareable] = useState(canShareFiles);

  useEffect(() => { closeRef.current?.focus(); }, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImage(img);
    img.src = photo.src;
    const st = new Image();
    st.onload = () => setStamp(st);
    st.src = '/stamp.svg';
  }, [photo]);

  useEffect(() => {
    const c = frontRef.current?.getContext('2d');
    if (c) drawFront(c, image, RIBBON);
  }, [image]);

  useEffect(() => {
    const c = backRef.current?.getContext('2d');
    if (c) drawBack(c, { note: note.trim() || 'wish you were up here', stamp, date: new Date(), place: PLACE, credit: CREDIT });
  }, [note, stamp]);

  const side = () => (flipped ? backRef.current : frontRef.current);
  const fileName = () => 'postcard-' + (flipped ? 'back' : 'front') + '.png';

  function download() {
    side().toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, 'image/png');
  }
  function share() {
    side().toBlob((blob) => {
      if (!blob) return;
      navigator.share({ files: [new File([blob], fileName(), { type: 'image/png' })] }).catch(() => {});
    }, 'image/png');
  }
  function onKeyDown(e) {
    if (e.key !== 'Escape') return;
    e.stopPropagation();
    onClose();
  }

  return (
    <div className="win-overlay postcard" role="dialog" aria-modal="true" aria-label="Postcard" onKeyDown={onKeyDown} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="win">
        <div className="win-title">
          <button ref={closeRef} className="win-x" type="button" aria-label="Close" onClick={onClose} />
          <span>Postcard</span>
        </div>
        <div className="win-body postcard-body">
          <div className={'postcard-card' + (flipped ? ' flipped' : '')} onClick={() => setFlipped((f) => !f)} title="Click to flip the card over">
            <canvas ref={frontRef} className="front" width={CARD.w} height={CARD.h} aria-label="Postcard front" />
            <canvas ref={backRef} className="back" width={CARD.w} height={CARD.h} aria-label="Postcard back" />
          </div>
          <label className="postcard-hint" htmlFor="postcard-note">Write a note on the back (optional)</label>
          <textarea id="postcard-note" maxLength={220} value={note} onChange={(e) => setNote(e.target.value)} placeholder="wish you were up here" />
          <div className="postcard-buttons">
            <button className="btn" type="button" onClick={() => setFlipped((f) => !f)}>Flip</button>
            {shareable && <button className="btn" type="button" onClick={share}>Share</button>}
            <button className="btn" type="button" onClick={download}>Download this side</button>
          </div>
        </div>
      </div>
    </div>
  );
}
