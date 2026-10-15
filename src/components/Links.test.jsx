import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Links from './Links.jsx';

afterEach(cleanup);

describe('Links', () => {
  it('names the five places in one plain sentence, each name a link to the profile', () => {
    render(<Links />);
    const sentence = screen.getByText(/^Elsewhere:/);
    expect(sentence.textContent).toBe('Elsewhere: LinkedIn, X, Instagram, Devpost, and GitHub.');
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual(['LinkedIn', 'X', 'Instagram', 'Devpost', 'GitHub']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://www.linkedin.com/in/kevin--tang',
      'https://x.com/borrasque_',
      'https://www.instagram.com/kevntang_/',
      'https://devpost.com/bourrasque',
      'https://github.com/stampixel',
    ]);
  });

  it('uses plain links that open in the same tab, like every other link on the page', () => {
    render(<Links />);
    for (const a of screen.getAllByRole('link')) {
      expect(a.hasAttribute('target')).toBe(false);
      expect(a.hasAttribute('rel')).toBe(false);
    }
  });

  it('shows no logos or images, only text', () => {
    const { container } = render(<Links />);
    expect(container.querySelectorAll('img, svg')).toHaveLength(0);
  });
});
