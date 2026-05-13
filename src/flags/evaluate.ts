import type { Flag, Rule, Context } from "./types.ts";
import { getSegment } from "./segments.ts";
import { appendAuditEntry } from "./audit.ts";

/**
 * FNV-1a 32-bit stable hash. Maps a string to an integer in [0, 99].
 * Never calls Math.random — purely deterministic from the input string.
 */
function stableHashBucket(key: string): number {
  let h = 2166136261; // FNV offset basis (uint32)
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    // FNV prime multiplication, kept as uint32
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % 100;
}

function ruleMatches<T>(rule: Rule<T>, ctx: Context): boolean {
  switch (rule.kind) {
    case "percentage":
      // bucket is in [0, 99]; percentage 100 always matches, 0 never matches
      return stableHashBucket(ctx.key) < rule.percentage;
    case "attribute":
      return ctx.attributes[rule.attribute] === rule.expected;
    case "segment": {
      const seg = getSegment(rule.segment);
      return seg !== undefined && seg.predicate(ctx);
    }
  }
}

/**
 * Pure evaluation: returns the value of the first matching rule, or
 * `flag.defaultValue` if no rule matches. Appends one audit entry as a
 * side-effect.
 */
export function evaluate<T>(flag: Flag<T>, ctx: Context): T {
  let matchedRuleId: string | null = null;
  let value: T = flag.defaultValue;

  for (const rule of flag.rules) {
    if (ruleMatches(rule, ctx)) {
      matchedRuleId = rule.id;
      value = rule.value;
      break;
    }
  }

  appendAuditEntry({
    flagName: flag.name,
    contextSnapshot: { key: ctx.key, attributes: { ...ctx.attributes } },
    matchedRuleId,
    value,
    timestampMs: Date.now(),
  });

  return value;
}
