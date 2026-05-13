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

/**
 * Returns the latest audit entries. If `limit` is provided, returns at most
 * that many entries from the end of the buffer (newest last).
 */
export function auditLog(limit?: number): AuditEntry[] {
  if (limit === undefined) {
    return ring.slice();
  }
  return ring.slice(-limit);
}
