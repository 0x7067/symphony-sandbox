// BUG: every call schedules a new timer; previous timers fire too.
// FEATURE NEEDED: return a control object with trigger() and cancel().
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
): (...args: TArgs) => void {
  return (...args: TArgs) => {
    setTimeout(() => fn(...args), ms);
  };
}
