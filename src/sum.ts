export function sum(arr: readonly number[]): number {
  return arr.reduce((acc, n) => acc + n, 0);
}
