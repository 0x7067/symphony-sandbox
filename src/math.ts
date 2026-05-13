// Tiny math helpers for the symphony pipeline smoke test.
// Intentionally has a subtle bug for the agent to find via TDD.

export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Returns the larger of two numbers.
 * BUG: returns the smaller. The pipeline should write a failing test that
 * exposes this, then fix the implementation.
 */
export function max(a: number, b: number): number {
  return a < b ? b : a;
}
