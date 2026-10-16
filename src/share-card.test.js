// @vitest-environment node
import { readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { imageSize } from 'image-size';
import { JSDOM } from 'jsdom';
import { describe, it, expect } from 'vitest';

// The share card is what X, iMessage, LinkedIn and friends show for a link to the site.
// index.html declares it twice (Open Graph and Twitter) and the picture lives in public/.
// Everything here is read from the real files, so a stale width, a renamed picture, a
// mismatched alt text or a card over X's 5 MB limit fails before it ships.
const root = new URL('../', import.meta.url);
const head = new JSDOM(readFileSync(new URL('index.html', root), 'utf8')).window.document.head;

// Each key must appear exactly once in <head>, as either property= (Open Graph) or name= (Twitter).
// A real DOM lookup survives attribute reordering, entities and commented-out tags, which a regex would not.
const meta = (key) => {
  const tags = head.querySelectorAll(`meta[property="${key}"], meta[name="${key}"]`);
  expect(tags, `${key} must appear exactly once in <head>`).toHaveLength(1);
  return tags[0].getAttribute('content');
};

describe('share card metadata in index.html', () => {
  it('points Open Graph and Twitter at the same absolute JPEG URL on the www host', () => {
    expect(meta('og:image')).toBe(meta('twitter:image'));
    expect(meta('og:image')).toMatch(/^https:\/\/www\.jpegkevin\.com\/[^?]+\.jpg(\?v=\d+)?$/);
  });

  it('names a JPEG in public/ whose pixel size matches the declared width and height, under 5 MB', () => {
    const { pathname } = new URL(meta('og:image'));
    const file = new URL(`public${pathname}`, root);
    const { width, height, type } = imageSize(readFileSync(file));
    expect(type).toBe('jpg');
    expect(String(width)).toBe(meta('og:image:width'));
    expect(String(height)).toBe(meta('og:image:height'));
    expect(statSync(file).size).toBeLessThan(5 * 1024 * 1024);
  });

  it('describes the picture once, the same way, for both card formats', () => {
    const alt = meta('og:image:alt');
    expect(alt).toBeTruthy();
    expect(meta('twitter:image:alt')).toBe(alt);
    expect(alt.length).toBeLessThanOrEqual(420); // X drops alt text longer than this
  });

  // Added by the /ship coverage audit (Claude Fable 5.1), 2026-10-16: two guards on the picture itself.
  const picture = () => readFileSync(new URL(`public${new URL(meta('og:image')).pathname}`, root));

  // ?v= on the image URL -> sha256 of public/preview.jpg as shipped at that version
  // (regenerate with: shasum -a 256 public/preview.jpg). A new picture gets a new version and a new row.
  const SHIPPED_CARDS = {
    2: 'c95f237731e4d4f3de1555a2f6ac3fa23d1b886ef7057d09e3e76e5a619a334b',
  };

  // Value: protects=crawlers (X, iMessage, LinkedIn, Slack) refetch the card when the picture changes,
  //   because the image URL's ?v= changes with it;
  // fails_when=public/preview.jpg's bytes change while og:image still says ?v=2, or ?v= is bumped without
  //   recording the picture that shipped under it;
  // why_new=the tests above accept any ?v=\d+ and any picture whose size matches, so the old card behind a
  //   stale URL (the very thing ?v=2 fixes) passes them;
  // seam=none;
  // no_claim=green does not prove the CDN or any crawler cache was actually refreshed, nor that the picture
  //   looks right; it only pins the committed bytes to the committed version.
  it('bumps ?v= on the image URL whenever the picture itself changes', () => {
    const version = new URL(meta('og:image')).searchParams.get('v');
    expect(version, 'og:image needs a ?v= so crawlers refetch a changed card').toBeTruthy();
    expect(SHIPPED_CARDS[version], `?v=${version} has no recorded picture; add its sha256 to SHIPPED_CARDS`).toBeDefined();
    const hash = createHash('sha256').update(picture()).digest('hex');
    expect(hash, `public/preview.jpg no longer matches ?v=${version}; bump ?v= in index.html and record the new sha256`).toBe(SHIPPED_CARDS[version]);
  });

  // Value: protects=the card shows whole, name included, as a large image: between Open Graph's 1.91:1 and
  //   X's 2:1, at least 1200 px wide;
  // fails_when=a 3:2 photo export or a small render replaces preview.jpg, even with og:image:width/height
  //   updated to match it;
  // why_new=the size test above only checks declared == actual, so any shape or size passes it;
  // seam=none;
  // no_claim=green does not prove how each platform crops or that the name sits inside its safe area; the
  //   bounds come from the platforms' published guidance, not from rendering.
  it('keeps the picture at large-card shape: 1.9:1 to 2:1 and at least 1200 px wide', () => {
    const { width, height } = imageSize(picture());
    expect(width).toBeGreaterThanOrEqual(1200);
    expect(width / height).toBeGreaterThanOrEqual(1.9);
    expect(width / height).toBeLessThanOrEqual(2);
  });
});
