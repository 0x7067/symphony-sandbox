import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeFlagKey } from "./implement-task-smoke.ts";

test("normalizeFlagKey: trims surrounding whitespace", () => {
  assert.equal(normalizeFlagKey("  Hello  "), "hello");
});

test("normalizeFlagKey: lowercases the key", () => {
  assert.equal(normalizeFlagKey("HeLLo"), "hello");
});

test("normalizeFlagKey: trims and lowercases together", () => {
  assert.equal(normalizeFlagKey("  HeLLo  "), "hello");
});