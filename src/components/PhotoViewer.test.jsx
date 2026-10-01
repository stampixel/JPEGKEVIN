import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import PhotoViewer from './PhotoViewer.jsx';

const photos = [
  { name: 'a.jpg', src: '/a.jpg', width: 2048, height: 1365, alt: 'Photo A' },
  { name: 'b.jpg', src: '/b.jpg', width: 1365, height: 2048, alt: 'Photo B' },
  { name: 'c.jpg', src: '/c.jpg', width: 2048, height: 1365, alt: 'Photo C' },
];
const noop = () => {};

afterEach(cleanup);

describe('PhotoViewer', () => {
  it('shows the current photo and its position in the set', () => {
    render(<PhotoViewer photos={photos} index={1} onChange={noop} onClose={noop} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Photo 2 of 3')).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Photo B' }).getAttribute('src')).toBe('/b.jpg');
  });

  it('links to the full-size file, labelled with its pixel size', () => {
    render(<PhotoViewer photos={photos} index={1} onChange={noop} onClose={noop} />);
    const link = screen.getByRole('link', { name: 'full size (1365 x 2048)' });
    expect(link.getAttribute('href')).toBe('/b.jpg');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('steps to the next and previous photo, wrapping at the ends', () => {
    const onChange = vi.fn();
    render(<PhotoViewer photos={photos} index={2} onChange={onChange} onClose={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next >>' }));
    expect(onChange).toHaveBeenLastCalledWith(0);
    fireEvent.click(screen.getByRole('button', { name: '<< Prev' }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('responds to the arrow keys and Escape', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<PhotoViewer photos={photos} index={0} onChange={onChange} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(1);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes from the title bar button or a click outside the window, but not on the photo', () => {
    const onClose = vi.fn();
    render(<PhotoViewer photos={photos} index={0} onChange={noop} onClose={onClose} />);
    fireEvent.click(screen.getByRole('img', { name: 'Photo A' }));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('moves keyboard focus to the Close button when it opens', () => {
    render(<PhotoViewer photos={photos} index={0} onChange={noop} onClose={noop} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });

  it('puts the photo position in the tab title while open and restores it after', () => {
    document.title = 'Kevin Tang';
    const { unmount } = render(<PhotoViewer photos={photos} index={1} onChange={noop} onClose={noop} />);
    expect(document.title).toBe('Photo 2 of 3 - Kevin Tang');
    unmount();
    expect(document.title).toBe('Kevin Tang');
  });
});
