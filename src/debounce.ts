export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  ms: number,
): { trigger(...args: TArgs): void; cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    trigger(...args: TArgs): void {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    },
    cancel(): void {
      clearTimeout(timer);
      timer = undefined;
    },
  };
}
