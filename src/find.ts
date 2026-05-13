export function firstIndexOf<T>(arr: readonly T[], target: T): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i + 1; // BUG: off by one
  }
  return -1;
}
