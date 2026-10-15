import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';

// The sky draws on a canvas and fetches the weather; neither exists in jsdom.
vi.mock('./components/Sky.jsx', () => ({ default: () => null }));

import App from './App.jsx';

beforeAll(() => {
  window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
});
afterEach(cleanup);

describe('App', () => {
  it('ends the Kevin Tang window with the Elsewhere links', () => {
    render(<App />);
    const window_ = screen.getByRole('region', { name: 'Kevin Tang' });
    const about = window_.querySelector('.about');
    expect(about.lastElementChild.textContent).toBe('Elsewhere: LinkedIn, X, Instagram, Devpost and GitHub.');
    expect(within(window_).getAllByRole('link').map((a) => a.textContent)).toEqual(['LinkedIn', 'X', 'Instagram', 'Devpost', 'GitHub']);
  });
});
