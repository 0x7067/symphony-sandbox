export interface AuditEntry {
  flagName: string;
  contextSnapshot: unknown;
  matchedRuleId: string | null;
  value: unknown;
  timestampMs: number;
}

const RING_CAP = 1000;
const ring: AuditEntry[] = [];

export function appendAuditEntry(entry: AuditEntry): void {
  if (ring.length >= RING_CAP) {
    ring.shift(); // drop oldest to stay within cap
  }
  ring.push(entry);
}

export function auditLog(limit?: number): AuditEntry[] {
  return limit === undefined ? ring.slice() : ring.slice(-limit);
}
