export function pascal(s: string): string {
  return s
    .toLowerCase()
    .replace(/(?:^|[-_\s]+)(.)/g, (_, c) => c.toUpperCase());
}
