import { test } from "node:test";
import assert from "node:assert/strict";
import { topoSort, CycleError } from "./graph.ts";

test("topoSort: linear chain a->b->c", () => {
  assert.deepEqual(topoSort(["a","b","c"], [["a","b"], ["b","c"]]), ["a","b","c"]);
});

test("topoSort: throws CycleError with cycle field on a cycle", () => {
  assert.throws(
    () => topoSort(["a","b"], [["a","b"],["b","a"]]),
    (err: unknown) => {
      assert.ok(err instanceof CycleError, "expected CycleError");
      assert.ok(Array.isArray(err.cycle), "expected cycle field to be an array");
      assert.ok(err.cycle.length >= 2, "cycle must have at least 2 nodes");
      return true;
    }
  );
});

test("topoSort: includes disconnected nodes with no edges", () => {
  const result = topoSort(["a","b","c"], [["a","b"]]);
  assert.equal(result.length, 3, "all three nodes must be returned");
  assert.ok(result.includes("c"), "disconnected node 'c' must be in result");
  assert.ok(result.indexOf("a") < result.indexOf("b"), "a must come before b");
});
