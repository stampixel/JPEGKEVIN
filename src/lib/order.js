// Puts the photos named in `preferredNames` first, in that order, then every
// other photo sorted by file name. Names that no longer exist are ignored, so
// the list can be edited freely and new photos appear without touching it.
export function orderByPreference(photos, preferredNames) {
  const byName = new Map(photos.map((photo) => [photo.name, photo]));
  const preferred = [...new Set(preferredNames)].map((name) => byName.get(name)).filter(Boolean);
  const chosen = new Set(preferred);
  const rest = photos
    .filter((photo) => !chosen.has(photo))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...preferred, ...rest];
}
