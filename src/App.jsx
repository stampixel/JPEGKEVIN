import { useEffect, useRef, useState } from 'react';
import Album from './components/Album.jsx';
import Desk from './components/Desk.jsx';
import Gauge from './components/Gauge.jsx';
import PhotoViewer from './components/PhotoViewer.jsx';
import PostcardDialog from './components/PostcardDialog.jsx';
import Sky from './components/Sky.jsx';
import { featured, album, all } from './photos.js';
import { newest } from './lib/fresh.js';
import { orderByHeight, describeHeight, nearestRow } from './lib/heights.js';

// Once heights are filled in, the album becomes a building: highest photo first.
const heightsKnown = all.some((p) => p.altitude != null);
const albumPhotos = heightsKnown ? orderByHeight(album) : album;
// Everything the viewer can step through: the Photo of the Month first, then the album.
const viewerPhotos = [featured, ...albumPhotos];
const freshPrints = newest(all, 6);

// "#12" in the address bar opens photo 12.
function indexFromHash() {
  const match = /^#(\d+)$/.exec(window.location.hash);
  const n = match ? Number(match[1]) : NaN;
  return n >= 1 && n <= viewerPhotos.length ? n - 1 : null;
}

const NARROW = '(max-width: 520px)';        // album: one landscape or two portraits per row
const SLIM_GAUGE = '(max-width: 1259px)';  // below this the full tower and its scale would touch the page
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// The height of whatever row of photos is in the middle of the screen right now.
function useHeightInView(enabled) {
  const [height, setHeight] = useState(featured.altitude);
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => {
      const line = window.innerHeight * 0.45;
      if (document.querySelector('.footer')?.getBoundingClientRect().top < window.innerHeight) { setHeight(0); return; }
      const rows = [...document.querySelectorAll('.potm, .album .row')].map((el) => {
        const r = el.getBoundingClientRect();
        const raw = el.classList.contains('potm') ? featured.altitude : el.dataset.height;
        return { top: r.top, bottom: r.bottom, value: raw === '' || raw == null ? null : Number(raw) };
      });
      setHeight(nearestRow(rows, line) ?? null);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [enabled]);
  return height;
}

function App() {
  const narrow = useMediaQuery(NARROW);
  const slimGauge = useMediaQuery(SLIM_GAUGE);
  const [open, setOpen] = useState(indexFromHash);
  const [postcard, setPostcard] = useState(null);
  const returnTo = useRef(null);
  const heightInView = useHeightInView(heightsKnown);

  const show = (index) => {
    returnTo.current = document.activeElement;
    setOpen(index);
  };
  const close = () => {
    setOpen(null);
    returnTo.current?.focus?.();
  };

  // On narrow screens the slim gauge needs a gutter down the right edge.
  useEffect(() => {
    document.body.classList.toggle('has-gauge', heightsKnown);
  }, []);

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

        <div className="section-bar" id="fresh">&#9733; Fresh Prints</div>
        <Desk photos={freshPrints} onOpen={(p) => show(viewerPhotos.indexOf(p))} />
        <p className="desk-hint">push them around, or click one to look closer.</p>

        <div className="section-bar" id="album">&#9733; My Photo Album ({albumPhotos.length} photos)</div>
        <Album photos={albumPhotos} narrow={narrow} onOpen={(i) => show(i + 1)} />

        <div className="rainbow-rule" />

        <div className="footer">&copy; Kevin Tang. All photos taken by ME.</div>
      </div>

      <Sky />
      {heightsKnown && <Gauge height={heightInView} slim={slimGauge} />}

      {open !== null && (
        <PhotoViewer
          photos={viewerPhotos}
          index={open}
          onChange={setOpen}
          onClose={close}
          onPostcard={setPostcard}
          subtitle={(p) => (p.altitude != null ? describeHeight(p.altitude) : null)}
          inert={postcard !== null}
        />
      )}
      {postcard && <PostcardDialog photo={postcard} onClose={() => setPostcard(null)} />}
    </>
  );
}

export default App;
