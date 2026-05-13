export function capitalize(s: string): string {
  // BUG: uppercases the LAST character instead of the first
  if (s.length === 0) return s;
  return s.slice(0, -1) + s[s.length - 1].toUpperCase();
}
