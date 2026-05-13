import type { Context } from "./types.ts";

export interface Segment {
  name: string;
  predicate: (ctx: Context) => boolean;
}

const segmentRegistry = new Map<string, Segment>();

export function defineSegment(
  name: string,
  predicate: (ctx: Context) => boolean,
): void {
  segmentRegistry.set(name, { name, predicate });
}

export function getSegment(name: string): Segment | undefined {
  return segmentRegistry.get(name);
}
