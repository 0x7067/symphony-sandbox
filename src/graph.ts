export class CycleError extends Error {
  cycle: string[];
  constructor(cycle: string[]) {
    super(`Cycle detected: ${cycle.join(" -> ")}`);
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

  // If not all nodes were emitted, there is a cycle
  if (result.length !== nodes.length) {
    // Find one cycle via DFS on remaining nodes
    const visited = new Set(result);
    const onStack = new Set<string>();
    const parent = new Map<string, string>();
    let cycleNodes: string[] = [];

    const dfs = (v: string): boolean => {
      visited.add(v);
      onStack.add(v);
      for (const w of adj.get(v) ?? []) {
        if (onStack.has(w)) {
          // Reconstruct cycle
          const cycle: string[] = [w];
          let cur = v;
          while (cur !== w) {
            cycle.push(cur);
            cur = parent.get(cur)!;
          }
          cycle.push(w);
          cycle.reverse();
          cycleNodes = cycle;
          return true;
        }
        if (!visited.has(w)) {
          parent.set(w, v);
          if (dfs(w)) return true;
        }
      }
      onStack.delete(v);
      return false;
    };

    for (const n of nodes) {
      if (!visited.has(n)) {
        parent.set(n, n);
        if (dfs(n)) break;
      }
    }

    throw new CycleError(cycleNodes);
  }

  return result;
}
