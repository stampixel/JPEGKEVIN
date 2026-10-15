// How high above the street each photo was taken from, in metres.
// This drives the album order (highest first) and the CN Tower gauge. A photo with null is
// placed after the ones with a height and the gauge says "height not noted yet" for it.
// Edit by hand, or run the dev server and open /__labels. Entries marked "guess" were first
// estimated from the photo; Kevin reviewed the whole list on 2026-10-14.
export const HEIGHTS = {
  'DSC00027.jpg': 0,
  'DSC00159.jpg': 241.3,
  'DSC00363.jpg': 241.3,
  'DSC00378-2.jpg': 241.3,
  'DSC00398.jpg': 241.3,
  'DSC00417-2.jpg': 241.3,
  'DSC00598.jpg': 172,
  'DSC00671.jpg': 200,
  'DSC01970.jpg': 226,
  'DSC02043-2.jpg': 219,
  'DSC02249.jpg': 80,
  'DSC02406.jpg': 180,
  'DSC02420.jpg': 180,
  'DSC02704.jpg': 200,
  'DSC02790.jpg': 200,
  'DSC02996.jpg': 0, // guess
  'DSC03665.jpg': 90,
  'DSC04050.jpg': 180, // guess
  'DSC04090-2.jpg': 180,
  'DSC04148.jpg': 180,
  'DSC04214.jpg': 0,
  'DSC04489.jpg': 180,
  'DSC07820.jpg': 10,
  'DSC08308.jpg': 130,
  'DSC08889.jpg': 100,
  'DSC09240.jpg': 150,
  'DSC09634.jpg': 0,
  'IMG_5257.jpg': 200,
  'NKP05250 2.jpg': 350,
  'SONY ILCE-6100 6048x4024_000181.jpg': 250,
  'SONY ILCE-6100 6048x4024_000419-2.jpg': 275,
  'SONY ILCE-6100 6048x4024_000439.jpg': 275,
  'SONY ILCE-6100 6048x4024_000675.jpg': 350,
  'SONY ILCE-6100 6048x4024_001034.jpg': 350,
  'SONY ILCE-6100 6048x4024_001048.jpg': 350,
  'SONY ILCE-6100 6048x4024_001240.jpg': 350,
  'SONY ILCE-6100 6048x4024_001407.jpg': 350,
  'SONY ILCE-6100 6048x4024_001691.jpg': 80,
  'SONY ILCE-6100 6048x4024_001942.jpg': 100,
  'SONY ILCE-6100 6048x4024_002148.jpg': 180,
  'DSC00527.jpg': 185,
};
