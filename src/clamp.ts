export function clamp(n: number, lo: number, hi: number): number {
  // BUG: assumes lo <= hi; mishandles inverted bounds.
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}
