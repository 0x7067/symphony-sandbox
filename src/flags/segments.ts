import type { Context } from "./types.ts";

export interface Segment {
  name: string;
  predicate: (ctx: Context) => boolean;
}

const segments = new Map<string, Segment>();

export function defineSegment(name: string, predicate: (ctx: Context) => boolean): void {
  segments.set(name, { name, predicate });
}

export function getSegment(name: string): Segment | undefined {
  return segments.get(name);
}
