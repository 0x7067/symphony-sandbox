export function reverse<T>(arr: T[]): T[] {
  // BUG: mutates input.
  return arr.reverse();
}
