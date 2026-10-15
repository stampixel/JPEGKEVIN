import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';

// The sky draws on a canvas and fetches the weather; neither exists in jsdom.
vi.mock('./components/Sky.jsx', () => ({ default: () => null }));

import App from './App.jsx';
import { LINKS } from './links.js';

beforeAll(() => {
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
});
afterAll(() => vi.unstubAllGlobals());
afterEach(cleanup);

describe('App', () => {
  it('ends the Kevin Tang window with the Elsewhere links', () => {
    render(<App />);
    const window_ = screen.getByRole('region', { name: 'Kevin Tang' });
    const about = window_.querySelector('.about');
    expect(about.lastElementChild.textContent).toMatch(/^Elsewhere: /);
    expect(within(window_).getAllByRole('link').map((a) => a.textContent)).toEqual(LINKS.map(([name]) => name));
  });
});
