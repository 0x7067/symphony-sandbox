import { test } from "node:test";
import assert from "node:assert/strict";
import { isHexColor } from "./hex.ts";

test("isHexColor: valid 3-digit", () => {
  assert.equal(isHexColor("#abc"), true);
});
