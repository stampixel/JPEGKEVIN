import { describe, it, expect } from 'vitest';
import { packRows } from './rows.js';

const L = (name) => ({ name, width: 2048, height: 1365 });
const P = (name) => ({ name, width: 1365, height: 2048 });
const names = (rows) => rows.map((row) => row.map((p) => p.name));

describe('packRows on wide screens', () => {
  it('keeps photos strictly in order, two landscapes or three portraits to a row', () => {
    expect(names(packRows([L('a'), L('b'), L('c'), L('d')]))).toEqual([['a', 'b'], ['c', 'd']]);
    expect(names(packRows([P('a'), P('b'), P('c')]))).toEqual([['a', 'b', 'c']]);
  });

  it('mixes orientations rather than moving a photo out of order', () => {
    const rows = packRows([L('l1'), P('p1'), L('l2'), P('p2'), P('p3'), L('l3')]);
    expect(names(rows)).toEqual([['l1', 'p1'], ['l2', 'p2'], ['p3', 'l3']]);
    expect(rows.flat().map((p) => p.name)).toEqual(['l1', 'p1', 'l2', 'p2', 'p3', 'l3']);
  });

  it('leaves whatever is left as a shorter final row', () => {
    expect(names(packRows([L('a'), L('b'), L('c')]))).toEqual([['a', 'b'], ['c']]);
    expect(names(packRows([P('a')]))).toEqual([['a']]);
  });

  it('returns no rows for no photos', () => {
    expect(packRows([])).toEqual([]);
  });
});

describe('packRows on narrow screens', () => {
  it('puts a landscape alone and portraits in pairs, still in order', () => {
    expect(names(packRows([L('l1'), P('p1'), P('p2'), L('l2')], { narrow: true }))).toEqual([['l1'], ['p1', 'p2'], ['l2']]);
  });

  it('pairs a lone portrait with the landscape that follows it', () => {
    expect(names(packRows([P('p1'), L('l1'), P('p2')], { narrow: true }))).toEqual([['p1', 'l1'], ['p2']]);
  });
});
