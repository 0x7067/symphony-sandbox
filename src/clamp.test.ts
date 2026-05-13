import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp } from "./clamp.ts";

test("clamp: in range", () => {
  assert.equal(clamp(5, 0, 10), 5);
});

test("clamp: inverted bounds clamps to correct end", () => {
  // lo > hi: should behave as clamp(n, min(lo,hi), max(lo,hi))
  // 15 is above max(10,0)=10, so result should be 10, not 0
  assert.equal(clamp(15, 10, 0), 10);
});
