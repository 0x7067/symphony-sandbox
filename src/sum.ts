export function sum(arr: readonly number[]): number {
  // BUG: no initial value; reduce throws on empty array
  return arr.reduce((acc, n) => acc + n);
}
