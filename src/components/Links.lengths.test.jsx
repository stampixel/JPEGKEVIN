import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Value: protects=the sentence reads correctly for any length of links.js; fails_when=a pair renders
// "A, and B." or an empty list renders "Elsewhere: ."; why_new=Links.test.jsx renders only the real
// five-entry list; seam=none (test-side vi.doMock of ../links.js); no_claim=none beyond protects

afterEach(() => { cleanup(); vi.doUnmock('../links.js'); vi.resetModules(); });

async function renderWith(links) {
  vi.resetModules();
  vi.doMock('../links.js', () => ({ LINKS: links }));
  const { default: Links } = await import('./Links.jsx');
  return render(<Links />);
}

describe('Links with a list of another length (links.js is meant to be edited without touching the component)', () => {
  it('joins a pair with a plain "and"', async () => {
    await renderWith([['A', 'https://a.example/'], ['B', 'https://b.example/']]);
    expect(screen.getByText(/^Elsewhere:/).textContent).toBe('Elsewhere: A and B.');
  });

  it('names a single place as a full sentence', async () => {
    await renderWith([['A', 'https://a.example/']]);
    expect(screen.getByText(/^Elsewhere:/).textContent).toBe('Elsewhere: A.');
  });

  it('renders nothing for an empty list', async () => {
    const { container } = await renderWith([]);
    expect(container.innerHTML).toBe('');
  });
});
