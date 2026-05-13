// Symphony agent should add tests here that expose the max() bug.
import { test } from "node:test";
import assert from "node:assert/strict";
import { add, max } from "./math.ts";

test("max: returns the larger of two numbers", () => {
  assert.equal(max(3, 7), 7);
  assert.equal(max(7, 3), 7);
  assert.equal(max(5, 5), 5);
});

test("add: sums two numbers", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-1, 1), 0);
});
