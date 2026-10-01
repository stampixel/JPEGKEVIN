import { describe, it, expect } from 'vitest';
import { orderByPreference } from './order.js';

const photo = (name) => ({ name });
const names = (photos) => photos.map((p) => p.name);

describe('orderByPreference', () => {
  it('places preferred names first, in the preferred order', () => {
    const photos = [photo('a.jpg'), photo('b.jpg'), photo('c.jpg')];
    expect(names(orderByPreference(photos, ['c.jpg', 'a.jpg']))).toEqual(['c.jpg', 'a.jpg', 'b.jpg']);
  });

  it('appends photos that are not in the list, sorted by name', () => {
    const photos = [photo('zebra.jpg'), photo('DSC02.jpg'), photo('DSC01.jpg'), photo('IMG_9.jpg')];
    expect(names(orderByPreference(photos, ['zebra.jpg']))).toEqual(['zebra.jpg', 'DSC01.jpg', 'DSC02.jpg', 'IMG_9.jpg']);
  });

  it('ignores preferred names that no longer exist in the folder', () => {
    const photos = [photo('a.jpg'), photo('b.jpg')];
    expect(names(orderByPreference(photos, ['gone.jpg', 'b.jpg']))).toEqual(['b.jpg', 'a.jpg']);
  });

  it('does not mutate the input', () => {
    const photos = [photo('b.jpg'), photo('a.jpg')];
    orderByPreference(photos, []);
    expect(names(photos)).toEqual(['b.jpg', 'a.jpg']);
  });
});
