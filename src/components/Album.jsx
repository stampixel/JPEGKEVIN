import React from 'react';

// Import all images from the portfolio folder eagerly
const portfolioImages = import.meta.glob('/src/assets/portfolio/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', { eager: true });

// Hand-written captions for the featured shots; everything else gets its filename.
// Order here decides the order at the top of the album.
const CAPTIONS = {
  'DSC01970.jpg': { cap: 'downtown from the TOP!! my hands were shaking (from the wind. mostly)', alt: 'Night city viewed from the top of a tower, streets glowing below' },
  'DSC00598.jpg': { cap: 'DO NOT look down..... ok fine, look down (that is times square between my shoes)', alt: 'Looking straight down a skyscraper at Times Square with feet dangling over the edge' },
  'NKP04858.jpg': { cap: 'standing INSIDE the antenna frame. the city looks fake from up there', alt: 'Looking down from an illuminated white steel spire onto a city intersection at night' },
  'IMG_5257.jpg': { cap: 'the green bridge climb w/ J. almost to the top here', alt: 'Climbing a green-lit steel structure at night with a person ahead' },
  'DSC02704.jpg': { cap: 'the big tower in green + red. christmas came early this year', alt: 'A communications tower lit green and red seen across a rooftop at dusk' },
  'DSC00159.jpg': { cap: 'inside the OLD power station. very spooky. 10/10 would trespass respectfully again', alt: 'Foggy interior of an old power station with huge machinery' },
  'DSC02996.jpg': { cap: 'burnout night. you can basically SMELL this picture', alt: 'A car doing a burnout at night surrounded by smoke and red light' },
  'DSC04489.jpg': { cap: 'vertigo-cam!! straight down from the crane. do not ask how', alt: 'Looking straight down from a construction crane onto glowing city streets' },
};

// Shown elsewhere on the page, so keep it out of the album grid
const EXCLUDE = new Set(['DSC07820.jpg']);

const COLUMNS = 3;

const Album = () => {
  const photos = Object.entries(portfolioImages)
    .map(([path, module]) => {
      const name = path.split('/').pop();
      return { name, src: module.default, ...CAPTIONS[name] };
    })
    .filter((photo) => !EXCLUDE.has(photo.name));

  const captionOrder = Object.keys(CAPTIONS);
  photos.sort((a, b) => {
    const ai = captionOrder.indexOf(a.name);
    const bi = captionOrder.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  // Chunk into table rows of 3; leftover cells (or a final row) become "coming soon"
  const rows = [];
  for (let i = 0; i < photos.length; i += COLUMNS) {
    rows.push(photos.slice(i, i + COLUMNS));
  }
  const lastRowFillers = (COLUMNS - (photos.length % COLUMNS)) % COLUMNS;

  const soonCell = (key, colSpan) => (
    <td key={key} colSpan={colSpan}>
      <div className="uc-stripes uc-mini" />
      <span className="cap"><b>MORE PHOTOS<br />COMING SOON!!</b><br />(as soon as the scanner stops making that noise)</span>
    </td>
  );

  return (
    <div className="album-scroll">
      <table className="album">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((photo) => (
                <td key={photo.name}>
                  <a href={photo.src} target="_blank" rel="noopener noreferrer" title="click for the FULL SIZE version (56k warning!!)">
                    <img src={photo.src} alt={photo.alt || photo.name} loading="lazy" />
                  </a>
                  {photo.cap && <span className="cap">{photo.cap}</span>}
                  <span className="kb">{photo.name}</span>
                </td>
              ))}
              {rowIndex === rows.length - 1 &&
                lastRowFillers > 0 &&
                Array.from({ length: lastRowFillers }, (_, i) => soonCell(`soon-${i}`, 1))}
            </tr>
          ))}
          {lastRowFillers === 0 && <tr>{soonCell('soon-row', COLUMNS)}</tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Album;
