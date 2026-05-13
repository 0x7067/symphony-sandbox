import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "./csv.ts";

test("parseCsv: simple unquoted row", () => {
  assert.deepEqual(parseCsv("a,b,c"), [["a", "b", "c"]]);
});
