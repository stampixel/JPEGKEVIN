import { useEffect, useRef, useState } from 'react';
import Album from './components/Album.jsx';
import Desk from './components/Desk.jsx';
import Gauge from './components/Gauge.jsx';
import Links from './components/Links.jsx';
import PhotoViewer from './components/PhotoViewer.jsx';
import PostcardDialog from './components/PostcardDialog.jsx';
import Sky from './components/Sky.jsx';
import { album, all } from './photos.js';
import { newest } from './lib/fresh.js';
import { orderByHeight, describeHeight, trackGauge } from './lib/heights.js';

// Once heights are filled in, the album becomes a building: highest photo first.
const heightsKnown = all.some((p) => p.altitude != null);
const albumPhotos = heightsKnown ? orderByHeight(album) : album;
const viewerPhotos = albumPhotos;
const freshPrints = newest(all, 6);

// "#12" in the address bar opens photo 12.
function indexFromHash() {
  const match = /^#(\d+)$/.exec(window.location.hash);
  const n = match ? Number(match[1]) : NaN;
  return n >= 1 && n <= viewerPhotos.length ? n - 1 : null;
}

const NARROW = '(max-width: 520px)';        // album: one landscape or two portraits per row
const SLIM_GAUGE = '(max-width: 1299px)';  // below this there is no room beside the page for the building
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

// What the gauge should show for the current scroll position: the height of the row
// of photos on the reading line, whether the album is in view, and how far through it we are.
function useGauge(enabled) {
  const [state, setState] = useState({ visible: false, height: albumPhotos[0]?.altitude ?? null, progress: 0 });
  useEffect(() => {
    if (!enabled) return undefined;
    const update = () => {
      const album = document.querySelector('.album')?.getBoundingClientRect();
      if (!album) return;
      const footerTop = document.querySelector('.footer')?.getBoundingClientRect().top ?? Infinity;
      const rows = [...document.querySelectorAll('.album .row')].map((el) => {
        const r = el.getBoundingClientRect();
        const raw = el.dataset.height;
        return { top: r.top, bottom: r.bottom, value: raw === '' || raw == null ? null : Number(raw) };
      });
      setState(trackGauge({ rows, albumTop: album.top, albumBottom: album.bottom, footerTop, viewportHeight: window.innerHeight }));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [enabled]);
  return state;
}

function App() {
  const narrow = useMediaQuery(NARROW);
  const slimGauge = useMediaQuery(SLIM_GAUGE);
  const [open, setOpen] = useState(indexFromHash);
  const [postcard, setPostcard] = useState(null);
  const returnTo = useRef(null);
  const gauge = useGauge(heightsKnown);

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
        <section className="window" aria-labelledby="site-title">
          <h1 className="titlebar" id="site-title"><span>Kevin Tang</span></h1>
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
            <Links />
          </div>
        </section>

        <section className="window" aria-labelledby="fresh-title">
          <h2 className="titlebar" id="fresh-title"><span>Fresh Prints</span></h2>
          <div className="window-body">
            <Desk photos={freshPrints} onOpen={(p) => show(viewerPhotos.indexOf(p))} />
            <p className="desk-hint">push them around, or click one to look closer.</p>
          </div>
        </section>

        <section className="window" aria-labelledby="album-title">
          <h2 className="titlebar" id="album-title"><span>My Photo Album ({albumPhotos.length} photos)</span></h2>
          <div className="window-body">
            <Album photos={albumPhotos} narrow={narrow} onOpen={show} />
          </div>
        </section>

        <footer className="footer">&copy; Kevin Tang. All photos taken by ME.</footer>
      </div>

      <Sky />
      {heightsKnown && <Gauge height={gauge.height} slim={slimGauge} hidden={!gauge.visible} progress={gauge.progress} />}

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
