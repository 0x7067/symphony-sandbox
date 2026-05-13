import type { Flag, EvalContext, Rule } from "./types.ts";
import { getSegment } from "./segments.ts";
import { appendAudit } from "./audit.ts";

/** Deterministic djb2-style hash → value in [0, 100). */
function stablePercent(key: string): number {
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

function matchesRule<T>(rule: Rule<T>, ctx: EvalContext): boolean {
  if (rule.kind === "percentage") {
    return stablePercent(ctx.bucketKey) < rule.percentage;
  }
  if (rule.kind === "attribute") {
    return ctx.attributes?.[rule.attribute] === rule.value;
  }
  if (rule.kind === "segment") {
    const seg = getSegment(rule.segment);
    return seg ? seg.predicate(ctx) : false;
  }
  return false;
}

function ruleValue<T>(rule: Rule<T>): T {
  if (rule.kind === "attribute") return rule.returnValue;
  return rule.value;
}

export function evaluate<T>(flag: Flag<T>, ctx: EvalContext): T {
  const snapshot = { ...ctx };
  let matchedRuleId: string | null = null;
  let result: T = flag.defaultValue;

  for (const rule of flag.rules) {
    if (matchesRule(rule, ctx)) {
      matchedRuleId = rule.id;
      result = ruleValue(rule);
      break;
    }
  }

  appendAudit({
    flagName: flag.name,
    contextSnapshot: snapshot,
    matchedRuleId,
    value: result,
    timestampMs: Date.now(),
  });

  return result;
}
