export function gcd(a: number, b: number): number {
  // BUG: doesn't normalize signs.
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}
