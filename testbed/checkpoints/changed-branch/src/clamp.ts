export const clamp = (value: number, min: number, max: number): number => {
  if (min > max) {
    throw new RangeError(`min ${min} exceeds max ${max}`);
  }
  return Math.min(Math.max(value, min), max);
};
