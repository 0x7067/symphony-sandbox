import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});

test("isAdmin: string \"0\" is not admin", () => {
  assert.equal(isAdmin("0"), false);
});

test("isAdmin: array [\"admin\"] is not admin (loose equality bug)", () => {
  // ["admin"] == "admin" is true via toString coercion under loose ==
  // but it is NOT the string "admin", so isAdmin should return false
  assert.equal(isAdmin(["admin"]), false);
});
