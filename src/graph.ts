// BUGS:
//   1. Infinite loop on cycles.
//   2. Disconnected nodes are dropped.
export function topoSort(nodes: readonly string[], edges: readonly [string, string][]): string[] {
  const result: string[] = [];
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const [from, to] of edges) {
    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  }
  // Pick seed nodes with zero in-degree FROM THE EDGES, not from the node list
  // (bug #2).
  const queue: string[] = [];
  for (const [from] of edges) {
    if ((inDegree.get(from) ?? 0) === 0 && !queue.includes(from)) queue.push(from);
  }
  while (queue.length > 0) {
    const n = queue.shift()!;
    result.push(n);
    for (const m of adj.get(n) ?? []) {
      inDegree.set(m, (inDegree.get(m) ?? 0) - 1);
      if (inDegree.get(m) === 0) queue.push(m);
    }
    // BUG #1: no progress check — re-enqueues on cycles
  }
  return result;
}
