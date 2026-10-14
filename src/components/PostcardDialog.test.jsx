import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PostcardDialog from './PostcardDialog.jsx';

const photo = { name: 'a.jpg', src: '/a.jpg', width: 2048, height: 1365, alt: 'Photo A' };

beforeAll(() => {
  // jsdom has no canvas; a stub keeps the drawing code from throwing
  HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: (t, k) => (k === 'measureText' ? () => ({ width: 10 }) : () => {}) , set: () => true });
});
afterEach(cleanup);

describe('PostcardDialog', () => {
  it('opens on the front, flips to the back, and closes', () => {
    const onClose = vi.fn();
    const { container } = render(<PostcardDialog photo={photo} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Postcard' })).toBeTruthy();
    const card = container.querySelector('.postcard-card');
    expect(card.classList.contains('flipped')).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Flip' }));
    expect(card.classList.contains('flipped')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape without letting the key reach the page', () => {
    const onClose = vi.fn();
    const pageHandler = vi.fn();
    document.addEventListener('keydown', pageHandler);
    render(<PostcardDialog photo={photo} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Postcard' }), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(pageHandler).not.toHaveBeenCalled();
    document.removeEventListener('keydown', pageHandler);
  });
});
