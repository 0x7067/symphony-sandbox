import { test } from "node:test";
import assert from "node:assert/strict";
import { isHexColor } from "./hex.ts";

test("isHexColor: valid 3-digit", () => {
  assert.equal(isHexColor("#abc"), true);
});

test("isHexColor: rejects prefixed garbage like 'zzz#abc123'", () => {
  assert.equal(isHexColor("zzz#abc123"), false);
});
