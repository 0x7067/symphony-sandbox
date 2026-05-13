export class CycleError extends Error {
  cycle: string[];
  constructor(cycle: string[]) {
    super(`Cycle detected: ${cycle.join(" -> ")}`);
    this.name = "CycleError";
    this.cycle = cycle;
  }
}

export function topoSort(nodes: readonly string[], edges: readonly [string, string][]): string[] {
  const result: string[] = [];
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  // Initialize all nodes with in-degree 0
  for (const n of nodes) {
    inDegree.set(n, 0);
    adj.set(n, []);
  }

  for (const [from, to] of edges) {
    inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from)!.push(to);
  }

  // Seed queue with ALL zero-in-degree nodes from the full node list
  const queue: string[] = [];
  for (const n of nodes) {
    if ((inDegree.get(n) ?? 0) === 0) queue.push(n);
  }

  while (queue.length > 0) {
    const n = queue.shift()!;
    result.push(n);
    for (const m of adj.get(n) ?? []) {
      const deg = (inDegree.get(m) ?? 0) - 1;
      inDegree.set(m, deg);
      if (deg === 0) queue.push(m);
    }
  }

  // If not all nodes were emitted, there's a cycle
  if (result.length !== nodes.length) {
    // Find one cycle via DFS
    const visited = new Set<string>();
    const stack = new Set<string>();
    const parent = new Map<string, string>();

    const findCycle = (n: string): string[] | null => {
      visited.add(n);
      stack.add(n);
      for (const m of adj.get(n) ?? []) {
        if (!visited.has(m)) {
          parent.set(m, n);
          const cycle = findCycle(m);
          if (cycle) return cycle;
        } else if (stack.has(m)) {
          // Reconstruct cycle
          const cycle: string[] = [m];
          let cur = n;
          while (cur !== m) {
            cycle.unshift(cur);
            cur = parent.get(cur)!;
          }
          cycle.unshift(m);
          return cycle;
        }
      }
      stack.delete(n);
      return null;
    };

    for (const n of nodes) {
      if (!visited.has(n)) {
        const cycle = findCycle(n);
        if (cycle) throw new CycleError(cycle);
      }
    }

    // Fallback: shouldn't reach here, but throw with what we know
    throw new CycleError([...nodes.filter(n => !new Set(result).has(n))]);
  }

  return result;
}
