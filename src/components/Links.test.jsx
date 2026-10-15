import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Links from './Links.jsx';
import { LINKS } from '../links.js';

afterEach(cleanup);

describe('Links', () => {
  it('names the five places in one plain sentence, each name a link to the profile', () => {
    render(<Links />);
    const sentence = screen.getByText(/^Elsewhere:/);
    expect(sentence.textContent).toBe('Elsewhere: LinkedIn, X, Instagram, Devpost and GitHub.');
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['LinkedIn', 'X', 'Instagram', 'Devpost', 'GitHub']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://www.linkedin.com/in/kevin--tang',
      'https://x.com/borrasque_',
      'https://www.instagram.com/kevntang_/',
      'https://devpost.com/bourrasque',
      'https://github.com/stampixel',
    ]);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(LINKS.map(([, href]) => href));
  });

  it('opens each profile in a new tab without handing it the opener', () => {
    render(<Links />);
    for (const a of screen.getAllByRole('link')) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  it('shows no logos or images, only text', () => {
    const { container } = render(<Links />);
    expect(container.querySelectorAll('img, svg')).toHaveLength(0);
  });
});
