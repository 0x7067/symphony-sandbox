import { test } from "node:test";
import assert from "node:assert/strict";
import { sum } from "./sum.ts";

test("sum: non-empty array", () => {
  assert.equal(sum([1, 2, 3]), 6);
});

test("sum: empty array returns 0", () => {
  assert.equal(sum([]), 0);
});
