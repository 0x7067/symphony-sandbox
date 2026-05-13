import { test } from "node:test";
import assert from "node:assert/strict";
import { last } from "./last.ts";

test("last: empty array returns undefined", () => {
  assert.equal(last([]), undefined);
});
