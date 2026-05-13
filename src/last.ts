// Bug: last() should return the last element; returns the first.
export function last<T>(arr: readonly T[]): T | undefined {
  return arr[arr.length - 1];
}
