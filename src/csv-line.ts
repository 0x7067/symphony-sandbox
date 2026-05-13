// BUG: ignores quoted fields containing commas.
export function parseCsvLine(line: string): string[] {
  return line.split(",");
}
