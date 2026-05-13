// BUG: regex is unanchored; accepts substrings.
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHexColor(s: string): boolean {
  return HEX.test(s);
}
