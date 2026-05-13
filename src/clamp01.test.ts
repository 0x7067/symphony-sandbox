import { test } from "node:test";
import assert from "node:assert/strict";
import { clamp01 } from "./clamp01.ts";

test("clamp01: in-range value passes through", () => {
  assert.equal(clamp01(0.5), 0.5);
});

test("clamp01: value above 1 is clamped to 1", () => {
  assert.equal(clamp01(1.5), 1);
});

test("clamp01: value well above 1 is clamped to 1", () => {
  assert.equal(clamp01(100), 1);
});

test("clamp01: boundary value 1 passes through", () => {
  assert.equal(clamp01(1), 1);
});

test("clamp01: value below 0 is clamped to 0", () => {
  assert.equal(clamp01(-0.5), 0);
});

test("clamp01: boundary value 0 passes through", () => {
  assert.equal(clamp01(0), 0);
});
