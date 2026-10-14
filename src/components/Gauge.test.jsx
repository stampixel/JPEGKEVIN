import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import Gauge from './Gauge.jsx';

afterEach(cleanup);

describe('Gauge', () => {
  it('shows the current height and places the marker on the tower', () => {
    const { container } = render(<Gauge height={142} />);
    expect(container.querySelector('.gauge-label').textContent).toBe('about 142 m up, 43rd floor');
    const top = parseFloat(container.querySelector('.gauge-marker').style.top);
    expect(top).toBeCloseTo(100 - (142 / 553) * 100, 1);
  });

  it('sits at street level for the ground and says so', () => {
    const { container } = render(<Gauge height={0} />);
    expect(container.querySelector('.gauge-label').textContent).toBe('street level');
    expect(container.querySelector('.gauge-marker').style.top).toBe('100%');
  });

  it('has a slim edge version for narrow screens, with the same marker and label but no ticks', () => {
    const { container } = render(<Gauge height={350} slim />);
    expect(container.querySelector('.gauge-slim')).toBeTruthy();
    expect(container.querySelector('.gauge')).toBeNull();
    expect(container.querySelectorAll('.gauge-tick')).toHaveLength(0);
    expect(container.querySelector('.gauge-label').textContent).toBe('about 350 m up, 106th floor');
    expect(parseFloat(container.querySelector('.gauge-marker').style.top)).toBeCloseTo(100 - (350 / 553) * 100, 1);
  });

  it('never captures taps or clicks, in either version', () => {
    for (const slim of [false, true]) {
      const { container, unmount } = render(<Gauge height={10} slim={slim} />);
      expect(container.firstChild.getAttribute('aria-hidden')).toBe('true');
      expect(container.firstChild.classList.contains('gauge-inert')).toBe(true);
      unmount();
    }
  });
});
