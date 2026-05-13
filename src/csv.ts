export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // RFC 4180: two double-quotes inside a quoted field → one literal "
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

export function parseCsv(text: string): string[][] {
  return text.split(/\r?\n/).filter(Boolean).map(parseCsvLine);
}

export function parseCsvWithHeader(text: string): Array<Record<string, string>> {
  const rows = parseCsv(text);
  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((key, i) => {
      record[key] = row[i] ?? "";
    });
    return record;
  });
}
