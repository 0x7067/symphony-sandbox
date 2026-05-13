import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp01 } from "./clamp01.ts";

test("clamp01: in-range value passes through", () => {
  assert.equal(clamp01(0.5), 0.5);
});
