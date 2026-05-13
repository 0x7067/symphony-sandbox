export function safeLength(s: string | null | undefined): number {
  // BUG: doesn't handle null/undefined
  return (s as string).length;
}
