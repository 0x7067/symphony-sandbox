// Symphony agent should add tests here that expose the max() bug.
import { test } from "node:test";
import assert from "node:assert/strict";
import { add, max } from "./math.ts";

test("add: sums two numbers", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(add(-1, 1), 0);
});

test("max: returns the larger of two numbers", () => {
  assert.equal(max(3, 5), 5);
  assert.equal(max(10, 2), 10);
  assert.equal(max(-1, -3), -1);
});
