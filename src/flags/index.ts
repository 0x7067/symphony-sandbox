// Public barrel — re-exports the documented surface only.
export { FlagRegistry } from "./registry.ts";
export { evaluate } from "./evaluate.ts";
export { defineSegment, getSegment } from "./segments.ts";
export { auditLog } from "./audit.ts";
export { serialize, parseRegistry } from "./serialize.ts";
export { RegistryError, InvalidFlagError, EvaluationError, ParseError } from "./errors.ts";
export type { Flag, Rule, PercentageRule, AttributeRule, SegmentRule, EvalContext } from "./types.ts";
export type { Segment } from "./segments.ts";
export type { AuditEntry } from "./audit.ts";
