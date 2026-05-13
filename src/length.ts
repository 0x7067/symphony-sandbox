export function safeLength(s: string | null | undefined): number {
  return s == null ? 0 : s.length;
}
