import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin } from "./auth.ts";

test("isAdmin: literal admin is admin", () => {
  assert.equal(isAdmin("admin"), true);
});
