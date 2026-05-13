import type { EvalContext } from "./types.ts";

export interface AuditEntry {
  flagName: string;
  contextSnapshot: EvalContext;
  matchedRuleId: string | null;
  value: unknown;
  timestampMs: number;
}

const RING_CAP = 1000;
const ring: AuditEntry[] = [];

export function appendAudit(entry: AuditEntry): void {
  if (ring.length >= RING_CAP) {
    ring.shift();
  }
  ring.push(entry);
}

export function auditLog(limit?: number): AuditEntry[] {
  if (limit !== undefined && limit >= 0) {
    return ring.slice(-limit);
  }
  return ring.slice();
}
