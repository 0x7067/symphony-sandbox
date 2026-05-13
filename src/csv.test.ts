import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, parseCsvWithHeader } from "./csv.ts";

test("parseCsv: simple unquoted row", () => {
  assert.deepEqual(parseCsv("a,b,c"), [["a", "b", "c"]]);
});

describe("RFC 4180 extensions", () => {
  test("parseCsv: quoted-quote escape (\"\" → \")", () => {
    assert.deepEqual(
      parseCsv('a,"he said ""hi""",b'),
      [["a", 'he said "hi"', "b"]]
    );
  });

  test("parseCsv: empty cells stay empty strings", () => {
    assert.deepEqual(parseCsv("a,,c"), [["a", "", "c"]]);
  });

  test("parseCsvWithHeader: returns array of records keyed by header row", () => {
    assert.deepEqual(
      parseCsvWithHeader("a,b\n1,2\n3,4"),
      [{ a: "1", b: "2" }, { a: "3", b: "4" }]
    );
  });
});
