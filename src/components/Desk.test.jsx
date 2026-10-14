import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Desk from './Desk.jsx';

const photos = [1, 2, 3].map((i) => ({ name: 'p' + i + '.jpg', src: '/p' + i + '.jpg', width: 2048, height: 1365, alt: 'Print ' + i }));

afterEach(cleanup);

describe('Desk', () => {
  it('lays every photo on the desk as a print', () => {
    render(<Desk photos={photos} onOpen={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Print 2' })).toBeTruthy();
  });

  it('opens a print on a click that did not drag it', () => {
    const onOpen = vi.fn();
    render(<Desk photos={photos} onOpen={onOpen} />);
    const print = screen.getByRole('button', { name: 'Print 2' });
    fireEvent.pointerDown(print, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(print, { clientX: 12, clientY: 11, pointerId: 1 });
    expect(onOpen).toHaveBeenCalledWith(photos[1]);
  });

  it('does not open a print that was dragged', () => {
    const onOpen = vi.fn();
    render(<Desk photos={photos} onOpen={onOpen} />);
    const print = screen.getByRole('button', { name: 'Print 1' });
    fireEvent.pointerDown(print, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerMove(print, { clientX: 90, clientY: 40, pointerId: 1 });
    fireEvent.pointerUp(print, { clientX: 90, clientY: 40, pointerId: 1 });
    expect(onOpen).not.toHaveBeenCalled();
  });
});
