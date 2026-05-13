import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { topoSort, CycleError } from "./graph.ts";

test("topoSort: linear chain a->b->c", () => {
  assert.deepEqual(topoSort(["a","b","c"], [["a","b"], ["b","c"]]), ["a","b","c"]);
});

describe("topoSort: bug fixes", () => {
  test("throws CycleError with cycle field when a cycle exists", () => {
    assert.throws(
      () => topoSort(["a", "b"], [["a", "b"], ["b", "a"]]),
      (err: unknown) => {
        assert.ok(err instanceof CycleError, "expected a CycleError");
        assert.ok(Array.isArray((err as CycleError).cycle), "cycle field must be an array");
        assert.ok((err as CycleError).cycle.length >= 2, "cycle must contain at least 2 nodes");
        return true;
      }
    );
  });

  test("includes disconnected nodes in output", () => {
    const result = topoSort(["a", "b", "c"], [["a", "b"]]);
    assert.equal(result.length, 3, "all 3 nodes must be returned");
    assert.ok(result.includes("c"), "disconnected node 'c' must appear in result");
    // topological order constraint: a before b
    assert.ok(result.indexOf("a") < result.indexOf("b"), "a must come before b");
  });
});
