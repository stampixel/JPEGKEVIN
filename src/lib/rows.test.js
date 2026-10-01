import { describe, it, expect } from 'vitest';
import { groupRows } from './rows.js';

const L = (name) => ({ name, width: 2048, height: 1365 });
const P = (name) => ({ name, width: 1365, height: 2048 });
const names = (rows) => rows.map((row) => row.map((p) => p.name));

describe('groupRows on wide screens', () => {
  it('puts landscapes two to a row', () => {
    const rows = groupRows([L('a'), L('b'), L('c'), L('d')]);
    expect(names(rows)).toEqual([['a', 'b'], ['c', 'd']]);
  });

  it('puts portraits three to a row', () => {
    const rows = groupRows([P('a'), P('b'), P('c')]);
    expect(names(rows)).toEqual([['a', 'b', 'c']]);
  });

  it('never mixes orientations in a row and emits each row as soon as it fills', () => {
    const rows = groupRows([L('l1'), P('p1'), L('l2'), P('p2'), P('p3')]);
    expect(names(rows)).toEqual([['l1', 'l2'], ['p1', 'p2', 'p3']]);
  });

  it('gives a leftover landscape its own row and keeps leftover portraits together', () => {
    const rows = groupRows([L('l1'), L('l2'), L('l3'), P('p1'), P('p2')]);
    expect(names(rows)).toEqual([['l1', 'l2'], ['l3'], ['p1', 'p2']]);
  });

  it('flushes leftovers in the order they first appeared', () => {
    const rows = groupRows([P('p1'), L('l1')]);
    expect(names(rows)).toEqual([['p1'], ['l1']]);
  });

  it('returns no rows for no photos', () => {
    expect(groupRows([])).toEqual([]);
  });
});

describe('groupRows on narrow screens', () => {
  it('puts landscapes one to a row and portraits two to a row', () => {
    const rows = groupRows([L('l1'), P('p1'), P('p2'), L('l2')], { narrow: true });
    expect(names(rows)).toEqual([['l1'], ['p1', 'p2'], ['l2']]);
  });

  it('gives a leftover portrait its own row', () => {
    const rows = groupRows([P('p1'), P('p2'), P('p3')], { narrow: true });
    expect(names(rows)).toEqual([['p1', 'p2'], ['p3']]);
  });
});
