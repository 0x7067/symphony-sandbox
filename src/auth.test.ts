import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});

test("isAdmin: string '0' is not admin", () => {
  assert.equal(isAdmin("0"), false);
});

test("isAdmin: boxed String object 'admin' is not admin (strict equality required)", () => {
  // new String("admin") == "admin" is true via loose coercion, but should be rejected
  assert.equal(isAdmin(new String("admin")), false);
});
