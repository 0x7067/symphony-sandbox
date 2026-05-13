import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});

test("isAdmin: String object wrapping 'admin' is not admin (strict equality required)", () => {
  // new String("admin") loose-equals "admin" via coercion, but must be rejected
  assert.equal(isAdmin(new String("admin")), false);
});
