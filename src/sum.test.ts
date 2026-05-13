import { test } from "node:test";
import assert from "node:assert/strict";
import { sum } from "./sum.ts";

test("sum: non-empty array", () => {
  assert.equal(sum([1, 2, 3]), 6);
});
