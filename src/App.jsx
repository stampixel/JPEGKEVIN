import { useEffect, useRef, useState } from 'react';
import Album from './components/Album.jsx';
import PhotoViewer from './components/PhotoViewer.jsx';
import { featured, album } from './photos.js';

// Everything the viewer can step through: the Photo of the Month first, then the album.
const viewerPhotos = [featured, ...album];

// "#12" in the address bar opens photo 12.
function indexFromHash() {
  const match = /^#(\d+)$/.exec(window.location.hash);
  const n = match ? Number(match[1]) : NaN;
  return n >= 1 && n <= viewerPhotos.length ? n - 1 : null;
}

const NARROW = '(max-width: 520px)';
function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW).matches);
  useEffect(() => {
    const query = window.matchMedia(NARROW);
    const onChange = (e) => setNarrow(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

function App() {
  const narrow = useNarrow();
  const [open, setOpen] = useState(indexFromHash);
  const returnTo = useRef(null);

  const show = (index) => {
    returnTo.current = document.activeElement;
    setOpen(index);
  };
  const close = () => {
    setOpen(null);
    returnTo.current?.focus?.();
  };

  useEffect(() => {
    document.documentElement.style.overflow = open === null ? '' : 'hidden';
    const url = open === null ? window.location.pathname + window.location.search : '#' + (open + 1);
    window.history.replaceState(null, '', url);
  }, [open]);

  return (
    <>
      <div className="page" inert={open !== null}>
        <div className="masthead">
          <h1>Kevin Tang</h1>
        </div>

        <div className="about">
          <p>
            I think some questions are too big to answer. I don’t have any deeper reason on why I risk my
            life to take photos. I just kinda do it. Throughout life I’ve also noticed people who are good at one
            thing often have other things they are equally as good at, even if it is in a completely
            unadjacent field. I hope the photos I take while freeclimbing/urbexing are that ‘unadjacent’
            field.
          </p>
          <p>
            I don’t do anything I don’t enjoy, and some of the things I do enjoy are: programming,
            photography, cycling, and writing. I occasionally smoke too, it’s fun. I don’t have a lot of
            achievements, however some of the things I’m proud of are: 5-figure dropshipping business in
            high school, solo traveling to climb buildings, knowing how to lockpick really well, and being
            able to provide for my family. I am also proud of myself as a person. I hope I can make an impact
            on this world.
          </p>
        </div>

        <div className="rainbow-rule" />

        <div className="section-bar" id="potm">&#9733; Photo of the Month</div>
        <div className="potm">
          <a href={featured.src} onClick={(e) => { e.preventDefault(); show(0); }}>
            <img
              src={featured.src}
              alt={featured.alt}
              width={featured.width}
              height={featured.height}
              fetchPriority="high"
            />
          </a>
        </div>

        <div className="section-bar" id="album">&#9733; My Photo Album ({album.length} photos)</div>
        <Album photos={album} narrow={narrow} onOpen={(i) => show(i + 1)} />

        <div className="rainbow-rule" />

        <div className="footer">&copy; Kevin Tang. All photos taken by ME.</div>
      </div>

      {open !== null && (
        <PhotoViewer photos={viewerPhotos} index={open} onChange={setOpen} onClose={close} />
      )}
    </>
  );
}

export default App;
