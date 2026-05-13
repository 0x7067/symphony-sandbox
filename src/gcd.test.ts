import { test } from "node:test";
import assert from "node:assert/strict";
import { gcd } from "./gcd.ts";

test("gcd: positive inputs", () => {
  assert.equal(gcd(12, 8), 4);
});

test("gcd: negative inputs return positive gcd", () => {
  assert.equal(gcd(-12, 8), 4);
  assert.equal(gcd(12, -8), 4);
  assert.equal(gcd(-12, -8), 4);
});
