import { test } from "node:test";
import assert from "node:assert/strict";
import { safeLength } from "./length.ts";

test("safeLength: string", () => {
  assert.equal(safeLength("hi"), 2);
});

test("safeLength: null returns 0", () => {
  assert.equal(safeLength(null), 0);
});

test("safeLength: undefined returns 0", () => {
  assert.equal(safeLength(undefined), 0);
});
