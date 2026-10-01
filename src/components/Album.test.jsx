import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Album from './Album.jsx';

const L = (name) => ({ name, src: '/' + name, width: 2048, height: 1365, alt: name });
const P = (name) => ({ name, src: '/' + name, width: 1365, height: 2048, alt: name });
const photos = [L('l1.jpg'), L('l2.jpg'), P('p1.jpg'), P('p2.jpg'), P('p3.jpg')];
const noop = () => {};

afterEach(cleanup);

describe('Album', () => {
  it('shows every photo as a link to its file, in order', () => {
    render(<Album photos={photos} onOpen={noop} />);
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/l1.jpg', '/l2.jpg', '/p1.jpg', '/p2.jpg', '/p3.jpg']);
  });

  it('lays photos out in rows by orientation and reflows for narrow screens', () => {
    const { container, rerender } = render(<Album photos={photos} onOpen={noop} />);
    expect(container.querySelectorAll('.row').length).toBe(2);
    rerender(<Album photos={photos} narrow onOpen={noop} />);
    expect(container.querySelectorAll('.row').length).toBe(4);
  });

  it('opens the clicked photo instead of following the link', () => {
    const onOpen = vi.fn();
    render(<Album photos={photos} onOpen={onOpen} />);
    const followed = fireEvent.click(screen.getByRole('link', { name: 'p2.jpg' }));
    expect(onOpen).toHaveBeenCalledWith(3);
    expect(followed).toBe(false);
  });
});
