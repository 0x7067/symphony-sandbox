import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp } from "./clamp.ts";

test("clamp: in range", () => {
  assert.equal(clamp(5, 0, 10), 5);
});
