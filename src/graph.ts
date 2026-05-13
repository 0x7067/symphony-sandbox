export class CycleError extends Error {
  cycle: string[];
  constructor(cycle: string[]) {
    super(`Cycle detected: ${cycle.join(" -> ")}`);
    this.cycle = cycle;
  }
}

export function topoSort(nodes: readonly string[], edges: readonly [string, string][]): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n, 0);
    adj.set(n, []);
  }

  for (const [from, to] of edges) {
    inDegree.set(to, inDegree.get(to)! + 1);
    adj.get(from)!.push(to);
  }

  const queue = nodes.filter(n => inDegree.get(n) === 0);
  const result: string[] = [];

  while (queue.length > 0) {
    const n = queue.shift()!;
    result.push(n);
    for (const m of adj.get(n)!) {
      const deg = inDegree.get(m)! - 1;
      inDegree.set(m, deg);
      if (deg === 0) queue.push(m);
    }
  }

  if (result.length === nodes.length) return result;

  // Cycle exists — find one via DFS over unprocessed nodes
  const visited = new Set(result);
  const onStack = new Set<string>();
  const parent = new Map<string, string>();
  let cycleNodes: string[] = [];

  const dfs = (v: string): boolean => {
    visited.add(v);
    onStack.add(v);
    for (const w of adj.get(v)!) {
      if (onStack.has(w)) {
        const cycle = [w];
        let cur = v;
        while (cur !== w) { cycle.push(cur); cur = parent.get(cur)!; }
        cycle.push(w);
        cycleNodes = cycle.reverse();
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
    if (!visited.has(n) && dfs(n)) break;
  }

  throw new CycleError(cycleNodes);
}
