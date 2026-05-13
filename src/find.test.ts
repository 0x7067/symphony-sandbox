import { test } from "node:test";
import assert from "node:assert/strict";
import { firstIndexOf } from "./find.ts";

test("firstIndexOf: absent target returns -1", () => {
  assert.equal(firstIndexOf([1, 2, 3], 99), -1);
});

test("firstIndexOf: returns correct 0-based index for mid-array match", () => {
  assert.equal(firstIndexOf([1, 2, 3], 2), 1);
});
