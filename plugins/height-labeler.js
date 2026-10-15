import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseHeights, serializeHeights, withValue } from './heights-file.js';

const IMAGE = /\.(jpe?g|png|webp)$/i;

// Dev server only: a page at /__labels where each photo gets a "metres above the street" box.
// Saving writes src/heights.js, and the site hot-reloads with the new order and gauge.
export default function heightLabeler({ file = 'src/heights.js', photos = 'src/assets/portfolio' } = {}) {
  let root;
  return {
    name: 'height-labeler',
    apply: 'serve',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      const filePath = path.resolve(root, file);
      const folder = path.resolve(root, photos);

      const read = () => {
        const names = readdirSync(folder).filter((f) => IMAGE.test(f)).sort();
        let entries = existsSync(filePath) ? parseHeights(readFileSync(filePath, 'utf8')) : [];
        entries = entries.filter((e) => names.includes(e.name));
        for (const name of names) if (!entries.some((e) => e.name === name)) entries = withValue(entries, name, null);
        return entries;
      };
      const json = (res, body, status = 200) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      };

      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        if (url === '/__labels' && req.method === 'GET') {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(PAGE);
        } else if (url === '/__labels/data' && req.method === 'GET') {
          json(res, { entries: read() });
        } else if (url === '/__labels/data' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', () => {
            try {
              const { name, value } = JSON.parse(body);
              const metres = value === null || value === '' ? null : Number(value);
              if (typeof name !== 'string' || (metres !== null && !(metres >= 0 && metres <= 600))) return json(res, { error: 'bad value' }, 400);
              const entries = withValue(read(), name, metres);
              writeFileSync(filePath, serializeHeights(entries));
              json(res, { entries });
            } catch (e) {
              json(res, { error: String(e) }, 400);
            }
          });
        } else {
          next();
        }
      });
    },
  };
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Label heights</title>
<style>
  body { margin: 0; padding: 24px 12px 40px; background: #000030; font: 15px/1.5 Geneva, Verdana, "Lucida Grande", "DejaVu Sans", sans-serif; color: #000; }
  .page { max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #000; box-shadow: 2px 2px 0 #000; }
  .masthead { position: relative; height: 26px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #000; font: 700 18px/1 "Pixelify Sans", sans-serif; }
  .masthead::before { content: ""; position: absolute; left: 3px; right: 3px; top: 5px; bottom: 5px; background: repeating-linear-gradient(180deg, #000 0 1px, transparent 1px 3px); }
  .masthead span { position: relative; background: #fff; padding: 0 10px; }
  .help { margin: 14px; padding: 10px 12px; border: 1px solid #000; font-size: 14px; }
  .summary { margin: 0 14px 6px; font-size: 13px; }
  .row { display: flex; gap: 12px; align-items: center; margin: 8px 14px; padding: 8px; border: 1px solid #000; }
  .row img { width: 220px; height: auto; border: 1px solid #000; display: block; flex: none; }
  .row .name { font-size: 11px; color: #444; word-break: break-all; }
  .row input { width: 84px; font: 15px Geneva, Verdana, sans-serif; padding: 3px 6px; border: 1px solid #000; background: #fff; }
  .row .floor { font-size: 12px; color: #006600; min-height: 14px; margin-top: 4px; }
  .row .state { font-size: 11px; color: #CC0000; margin-top: 2px; }
  .row.done .state { color: #006600; }
  .btn95 { font: 12px Geneva, Verdana, sans-serif; background: #fff; border: 1px solid #000; border-radius: 6px; padding: 2px 10px; cursor: pointer; }
  .btn95:active { background: #000; color: #fff; }
  a { color: #000; }
  @font-face { font-family: "Pixelify Sans"; font-weight: 400 700; src: url("/fonts/pixelify-sans.woff2") format("woff2"); }
  @media (max-width: 560px) { .row { flex-direction: column; align-items: flex-start; } .row img { width: 100%; } }
</style>
</head>
<body>
<div class="page">
  <div class="masthead"><span>Label heights</span></div>
  <div class="help">For each photo, type how high above the street you were, in metres. Leave it blank if you don't know. It saves by itself into <b>src/heights.js</b>, and the site at <a href="/" target="_blank">localhost:5173</a> reloads with the new order and gauge. Entries marked as a guess were estimated by Claude; typing a number (even the same one) confirms it.</div>
  <div class="summary" id="summary"></div>
  <div id="list"></div>
</div>
<script>
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const floorOf = (m) => m == null ? '' : m < 6 ? 'street level' : 'about the ' + ordinal(Math.max(1, Math.round(m / 3.3))) + ' floor';
  const ordinal = (n) => { const r = n % 100; if (r >= 11 && r <= 13) return n + 'th'; return n + (['th', 'st', 'nd', 'rd'][n % 10] || 'th'); };
  const stateOf = (e) => e.value == null ? 'not noted yet' : e.guess ? 'guess by Claude, please confirm' : 'noted';
  const timers = {};
  function summary(entries) {
    const noted = entries.filter((e) => e.value != null && !e.guess).length, guesses = entries.filter((e) => e.guess).length;
    document.getElementById('summary').textContent = noted + ' of ' + entries.length + ' noted' + (guesses ? ', ' + guesses + ' still guesses' : '') + '.';
  }
  function render(entries) {
    document.getElementById('list').innerHTML = entries.map((e) => '<div class="row' + (e.value != null && !e.guess ? ' done' : '') + '" data-name="' + esc(e.name) + '">'
      + '<img src="/src/assets/portfolio/' + encodeURIComponent(e.name) + '" loading="lazy" alt="">'
      + '<div><div class="name">' + esc(e.name) + '</div>'
      + '<div style="margin-top:6px"><input type="number" min="0" max="600" step="1" placeholder="metres" value="' + (e.value ?? '') + '"> m &nbsp; '
      + '<button class="btn95 street" type="button">street level</button> <button class="btn95 clear" type="button">don\\'t know</button></div>'
      + '<div class="floor">' + floorOf(e.value) + '</div><div class="state">' + stateOf(e) + '</div></div></div>').join('');
    summary(entries);
  }
  async function save(row, value) {
    const name = row.dataset.name;
    row.querySelector('.state').textContent = 'saving...';
    const r = await fetch('/__labels/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, value }) });
    const { entries, error } = await r.json();
    if (error) { row.querySelector('.state').textContent = error; return; }
    const e = entries.find((x) => x.name === name);
    row.classList.toggle('done', e.value != null);
    row.querySelector('.state').textContent = stateOf(e);
    row.querySelector('.floor').textContent = floorOf(e.value);
    summary(entries);
  }
  document.addEventListener('input', (ev) => {
    const input = ev.target.closest('input'); if (!input) return;
    const row = input.closest('.row');
    row.querySelector('.floor').textContent = floorOf(input.value === '' ? null : Number(input.value));
    clearTimeout(timers[row.dataset.name]);
    timers[row.dataset.name] = setTimeout(() => save(row, input.value === '' ? null : Number(input.value)), 500);
  });
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button'); if (!btn) return;
    const row = btn.closest('.row'), input = row.querySelector('input');
    if (btn.classList.contains('street')) { input.value = '0'; save(row, 0); }
    if (btn.classList.contains('clear')) { input.value = ''; save(row, null); }
  });
  fetch('/__labels/data').then((r) => r.json()).then((d) => render(d.entries));
</script>
</body>
</html>
`;
