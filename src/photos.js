import manifest from 'virtual:photos';
import { orderByPreference } from './lib/order.js';

// Every image in src/assets/portfolio is on the site: drop a file in and it shows up.
// The list below only decides order; photos not named here follow it, sorted by file name.

// Shown big at the top of the page and first in the viewer.
export const FEATURED = 'DSC04050.jpg';

// Album order. Landscapes pair up two to a row and portraits three to a row,
// in this sequence, so neighbours here end up side by side on the page.
const S = 'SONY ILCE-6100 6048x4024_';
const ORDER = [
  'DSC02704.jpg', 'DSC01970.jpg',
  'DSC00598.jpg', 'DSC00344-2.jpg', 'DSC00939.jpg',
  S + '002148.jpg', 'DSC04489.jpg',
  'NKP04858.jpg', 'DSC04509.jpg',
  S + '001240.jpg', 'DSC00417.jpg', 'DSC02629.jpg',
  'DSC02043-2.jpg', 'DSC02174.jpg',
  'DSC00562.jpg', 'DSC01093.jpg', 'DSC02195.jpg',
  'DSC00602.jpg', 'DSC00758.jpg',
  S + '001034.jpg', S + '001048.jpg',
  'DSC02249.jpg', 'DSC01043.jpg',
  'DSC01189.jpg', 'DSC02790.jpg', 'DSC02795.jpg',
  'DSC00378.jpg', 'DSC02391.jpg',
  S + '001691.jpg', 'DSC04148.jpg',
  S + '000181.jpg', S + '000419.jpg',
  S + '001942.jpg', S + '000135.jpg',
  'DSC00159.jpg', 'IMG_5257.jpg', S + '001672.jpg',
  S + '000675.jpg', 'DSC03665.jpg',
  'DSC02996.jpg', 'DSC02406.jpg',
  'DSC04214.jpg', S + '000419-2.jpg',
  'DSC07820.jpg',
];

// Descriptions for screen readers and for when an image fails to load.
const ALT = {
  'DSC04050.jpg': 'Looking straight down from a rooftop onto a crowded, brightly lit square at night, legs over the edge',
  'DSC01970.jpg': 'Night city viewed from the top of a tower, streets glowing below',
  'DSC00598.jpg': 'Looking straight down a skyscraper at Times Square, feet over the edge',
  'NKP04858.jpg': 'Looking down from an illuminated white steel spire onto a city intersection at night',
  'IMG_5257.jpg': 'Climbing a green-lit steel structure at night, a person ahead',
  'DSC02704.jpg': 'A communications tower lit green and red, seen across a rooftop at dusk',
  'DSC00159.jpg': 'Foggy interior of an old power station with huge machinery',
  'DSC02996.jpg': 'A car doing a burnout at night, surrounded by smoke and red light',
  'DSC04489.jpg': 'Looking straight down from a construction crane onto glowing city streets',
  'DSC07820.jpg': 'Lightning splitting the sky over a glowing greenhouse and city buildings',
  'DSC02249.jpg': 'Rooftops of old downtown skyscrapers at blue hour, a person near the edge',
};

const all = manifest.map((photo) => ({ ...photo, alt: ALT[photo.name] ?? 'Photograph by Kevin Tang' }));

export const featured = all.find((photo) => photo.name === FEATURED) ?? all[0];
export const album = orderByPreference(all.filter((photo) => photo !== featured), ORDER);
