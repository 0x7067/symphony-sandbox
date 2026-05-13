import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { last } from "./last.ts";

test("last: empty array returns undefined", () => {
  assert.equal(last([]), undefined);
});

describe("last: non-empty arrays", () => {
  test("single-element array returns that element", () => {
    assert.equal(last([42]), 42);
  });

  test("multi-element array returns the last element, not the first", () => {
    assert.equal(last([1, 2, 3]), 3);
  });

  test("last element of string array is returned", () => {
    assert.equal(last(["a", "b", "c"]), "c");
  });

});
