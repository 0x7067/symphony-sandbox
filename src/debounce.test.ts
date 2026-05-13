import { test } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./debounce.ts";

test("debounce: function is callable", () => {
  const d = debounce(() => {}, 10);
  assert.ok(d);
});
