// Tiny math helpers for the symphony pipeline smoke test.

export function add(a: number, b: number): number {
  return a + b;
}

/** Returns the larger of two numbers. */
export function max(a: number, b: number): number {
  return a > b ? a : b;
}
