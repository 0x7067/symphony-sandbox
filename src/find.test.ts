import { test } from "node:test";
import assert from "node:assert/strict";
import { firstIndexOf } from "./find.ts";

test("firstIndexOf: absent target returns -1", () => {
  assert.equal(firstIndexOf([1, 2, 3], 99), -1);
});

test("firstIndexOf: mid-array match returns correct 0-based index", () => {
  assert.equal(firstIndexOf([1, 2, 3], 2), 1);
});
