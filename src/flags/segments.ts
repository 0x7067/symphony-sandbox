import type { EvalContext } from "./types.ts";

export interface Segment {
  name: string;
  predicate: (ctx: EvalContext) => boolean;
}

const segmentStore = new Map<string, Segment>();

export function defineSegment(
  name: string,
  predicate: (ctx: EvalContext) => boolean
): void {
  segmentStore.set(name, { name, predicate });
}

export function getSegment(name: string): Segment | undefined {
  return segmentStore.get(name);
}
