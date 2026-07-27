import { expect, test } from 'vitest';
import { clamp, slugify, unique } from '../src/index.js';

test('clamp bounds a value', () => {
  expect(clamp(15, 0, 10)).toBe(10);
  expect(() => clamp(1, 5, 0)).toThrow(RangeError);
});

test('slugify normalizes text', () => {
  expect(slugify('Héllo, Wörld!')).toBe('hello-world');
});

test('unique drops duplicates', () => {
  expect(unique([1, 1, 2])).toEqual([1, 2]);
});
