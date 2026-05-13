import { test } from "node:test";
import assert from "node:assert/strict";
import { isEven } from "./even.ts";

test("isEven: positive even", () => {
  assert.equal(isEven(4), true);
});
