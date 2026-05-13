// Public barrel — re-exports only the documented surface.
// Internal helpers (stableHashBucket, ruleMatches, appendAuditEntry, ring) are NOT re-exported.

export type { Flag, Rule, PercentageRule, AttributeRule, SegmentRule, Context } from "./types.ts";

export { FlagRegistry } from "./registry.ts";

export { evaluate } from "./evaluate.ts";

export { defineSegment, getSegment } from "./segments.ts";
export type { Segment } from "./segments.ts";

export { auditLog } from "./audit.ts";
export type { AuditEntry } from "./audit.ts";

export { serialize, parseRegistry } from "./serialization.ts";

export { RegistryError, InvalidFlagError, EvaluationError, ParseError } from "./errors.ts";
