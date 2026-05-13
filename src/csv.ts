import { parseCsvLine } from "./csv-line.ts";

export function parseCsv(text: string): string[][] {
  return text.split(/\r?\n/).filter(Boolean).map(parseCsvLine);
}
