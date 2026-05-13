import { test } from "node:test";
import assert from "node:assert/strict";
import { safeLength } from "./length.ts";

test("safeLength: string", () => {
  assert.equal(safeLength("hi"), 2);
});
