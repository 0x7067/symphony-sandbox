export function abs(n: number): number {
  // BUG: doesn't negate for negative inputs.
  return n < 0 ? -n : n;
}
