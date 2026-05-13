import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalize } from "./capitalize.ts";

test("capitalize: empty string", () => {
  assert.equal(capitalize(""), "");
});

test("capitalize: uppercases the first character and leaves the rest unchanged", () => {
  assert.equal(capitalize("hello"), "Hello");
});
