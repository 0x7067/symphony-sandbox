import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});

test("isAdmin: string '0' should not be admin", () => {
  assert.equal(isAdmin("0"), false);
});

test("isAdmin: array ['admin'] should not be admin (loose == coerces it to 'admin')", () => {
  assert.equal(isAdmin(["admin"]), false);
});
