import { test } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter } from "./rate-limiter.ts";

test("RateLimiter: constructs without throwing", () => {
  const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 1 });
  assert.ok(rl);
});
