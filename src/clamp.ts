export function clamp(n: number, lo: number, hi: number): number {
  const min = Math.min(lo, hi);
  const max = Math.max(lo, hi);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
