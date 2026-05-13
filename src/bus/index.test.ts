import { test } from "node:test";
import assert from "node:assert/strict";
// Existing baseline: the module loads without error.
test("bus index: module loads", async () => {
  await import("./index.ts");
  assert.ok(true);
});
