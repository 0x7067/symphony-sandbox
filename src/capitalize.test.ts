import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalize } from "./capitalize.ts";

test("capitalize: empty string", () => {
  assert.equal(capitalize(""), "");
});

test("capitalize: uppercases first character and leaves rest unchanged", () => {
  assert.equal(capitalize("hello"), "Hello");
  assert.equal(capitalize("world"), "World");
  assert.equal(capitalize("a"), "A");
});
