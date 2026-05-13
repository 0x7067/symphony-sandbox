export function gcd(a: number, b: number): number {
  // BUG: doesn't normalize signs.
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}
