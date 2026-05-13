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

  // If not all nodes were emitted, there's a cycle — find it via DFS
  if (result.length !== nodes.length) {
    const path: string[] = [];
    const onPath = new Set<string>();
    const done = new Set<string>();

    const findCycle = (n: string): string[] | null => {
      onPath.add(n);
      path.push(n);
      for (const m of adj.get(n) ?? []) {
        if (onPath.has(m)) return path.slice(path.indexOf(m));
        if (!done.has(m)) {
          const cycle = findCycle(m);
          if (cycle) return cycle;
        }
      }
      onPath.delete(n);
      path.pop();
      done.add(n);
      return null;
    };

    for (const n of nodes) {
      if (!done.has(n)) {
        const cycle = findCycle(n);
        if (cycle) throw new CycleError(cycle);
      }
    }
  }

  return result;
}
