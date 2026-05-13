import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp } from "./clamp.ts";

test("clamp: in range", () => {
  assert.equal(clamp(5, 0, 10), 5);
});

test("clamp: inverted bounds clamp to correct range", () => {
  // When lo > hi, should clamp into [min(lo,hi), max(lo,hi)] = [0, 10]
  // clamp(15, 10, 0) => 10 (above max), clamp(-5, 10, 0) => 0 (below min)
  assert.equal(clamp(15, 10, 0), 10);
  assert.equal(clamp(-5, 10, 0), 0);
  assert.equal(clamp(5, 10, 0), 5);
});
