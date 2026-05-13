import { test } from "node:test";
import assert from "node:assert/strict";
import { capitalize } from "./capitalize.ts";

test("capitalize: empty string", () => {
  assert.equal(capitalize(""), "");
});

test("capitalize: first character is uppercased", () => {
  assert.equal(capitalize("hello"), "Hello");
});
