export function isEven(n: number): boolean {
  // BUG: % on negatives returns -0 / negative; the > 0 check excludes valid evens.
  return n % 2 === 0 && n > 0;
}
