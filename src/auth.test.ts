import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});

test("isAdmin: object coerced to \"admin\" via valueOf must not be admin (loose equality bug)", () => {
  const fakeAdmin = { valueOf: () => "admin", toString: () => "admin" };
  assert.equal(isAdmin(fakeAdmin), false);
});
