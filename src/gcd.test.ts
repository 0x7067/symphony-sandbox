import { test } from "node:test";
import assert from "node:assert/strict";
import { gcd } from "./gcd.ts";

test("gcd: positive inputs", () => {
  assert.equal(gcd(12, 8), 4);
});
