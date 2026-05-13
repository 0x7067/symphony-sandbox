export function capitalize(s: string): string {
  // BUG: uppercases the LAST character instead of the first
  if (s.length === 0) return s;
  return s[0].toUpperCase() + s.slice(1);
}
