// Bug: clamp01 should return n clamped into [0, 1] but ignores the upper bound.
export function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}
