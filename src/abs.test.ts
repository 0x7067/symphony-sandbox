import { test } from "node:test";
import assert from "node:assert/strict";
import { abs } from "./abs.ts";

test("abs: positive", () => {
  assert.equal(abs(5), 5);
});

test("abs: negative returns positive", () => {
  assert.equal(abs(-7), 7);
});
