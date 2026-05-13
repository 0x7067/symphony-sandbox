import { test } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter } from "./rate-limiter.ts";

test("RateLimiter: constructs without throwing", () => {
  const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 1 });
  assert.ok(rl);
});

test("RateLimiter: token-bucket behaviour", () => {
  // AC2: tryConsume returns true and deducts tokens when sufficient
  const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 1 });
  assert.equal(rl.tryConsume(5, 0), true, "should succeed when bucket has enough tokens");

  // AC2: returns false when insufficient tokens remain (bucket now at 5)
  assert.equal(rl.tryConsume(6, 0), false, "should fail when not enough tokens");

  // AC3: tokens accrue between calls; 10 ms * 1/ms = 10 tokens refilled, capped at maxTokens=10
  // bucket was at 5, after 5ms it has 5+5=10, so consuming 10 should succeed
  assert.equal(rl.tryConsume(10, 5), true, "should succeed after refill brings bucket back up");

  // AC4: bucket never exceeds maxTokens even after long idle
  const rl2 = new RateLimiter({ maxTokens: 5, refillPerMs: 1 });
  // consume all 5 at t=0
  assert.equal(rl2.tryConsume(5, 0), true);
  // wait 1000ms — refill capped at maxTokens=5, not 1000
  assert.equal(rl2.tryConsume(5, 1000), true, "should have exactly maxTokens after long idle, not more");
  // immediately after consuming 5, bucket is 0 — next consume should fail
  assert.equal(rl2.tryConsume(1, 1000), false, "bucket should be empty after consuming maxTokens");
});
