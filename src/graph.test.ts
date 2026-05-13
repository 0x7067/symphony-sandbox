import { test } from "node:test";
import assert from "node:assert/strict";
import { topoSort } from "./graph.ts";

test("topoSort: linear chain a->b->c", () => {
  assert.deepEqual(topoSort(["a","b","c"], [["a","b"], ["b","c"]]), ["a","b","c"]);
});
