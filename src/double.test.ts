import { test } from "node:test";
import assert from "node:assert/strict";
import { double } from "./double.ts";
test("double: 0 → 0", () => { assert.equal(double(0), 0); });
test("double: 1 → 2", () => { assert.equal(double(1), 2); });
test("double: 5 → 10", () => { assert.equal(double(5), 10); });
test("double: negative number", () => { assert.equal(double(-3), -6); });
