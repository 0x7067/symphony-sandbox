import { test } from "node:test";
import assert from "node:assert/strict";
import { reverse } from "./reverse.ts";

test("reverse: returns reversed order", () => {
  assert.deepEqual(reverse([1, 2, 3]), [3, 2, 1]);
});

test("reverse: does not mutate the input array", () => {
  const input = [1, 2, 3];
  reverse(input);
  assert.deepEqual(input, [1, 2, 3]);
});
