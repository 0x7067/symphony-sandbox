import { test } from "node:test";
import assert from "node:assert/strict";
import { double } from "./double.ts";
test("double: 0 → 0", () => { assert.equal(double(0), 0); });
