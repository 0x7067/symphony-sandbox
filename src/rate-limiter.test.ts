import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RateLimiter } from "./rate-limiter.ts";

test("RateLimiter: constructs without throwing", () => {
  const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 1 });
  assert.ok(rl);
});

describe("RateLimiter: token-bucket behaviour", () => {
  test("tryConsume returns true and deducts tokens when sufficient tokens available", () => {
    const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 0 });
    // Bucket starts full (10 tokens). Consuming 5 should succeed.
    assert.equal(rl.tryConsume(5, 0), true);
    // After consuming 5, consuming 6 should fail (only 5 remain).
    assert.equal(rl.tryConsume(6, 0), false);
  });

  test("tryConsume returns false and leaves bucket unchanged when insufficient tokens", () => {
    const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 0 });
    // Consume all 10 tokens.
    assert.equal(rl.tryConsume(10, 0), true);
    // Now empty — consuming 1 must fail.
    assert.equal(rl.tryConsume(1, 0), false);
    // Bucket unchanged: consuming 0 tokens still fails to prove nothing extra accrued.
    // Try again at same time — still empty.
    assert.equal(rl.tryConsume(1, 0), false);
  });

  test("tokens accrue continuously between calls based on elapsed time", () => {
    // refillPerMs = 2, so 5 ms → 10 new tokens
    const rl = new RateLimiter({ maxTokens: 100, refillPerMs: 2 });
    // Start at t=0, drain all 100 tokens.
    assert.equal(rl.tryConsume(100, 0), true);
    // At t=5ms, only 10 tokens have accrued — consuming 11 should fail.
    assert.equal(rl.tryConsume(11, 5), false);
    // Consuming exactly 10 should succeed.
    assert.equal(rl.tryConsume(10, 5), true);
  });

  test("bucket never exceeds maxTokens after long idle period", () => {
    const rl = new RateLimiter({ maxTokens: 10, refillPerMs: 1 });
    // Drain bucket at t=0.
    assert.equal(rl.tryConsume(10, 0), true);
    // After 10000 ms, refill would be 10000 tokens but cap is 10.
    // Consuming 11 must fail.
    assert.equal(rl.tryConsume(11, 10000), false);
    // Consuming exactly maxTokens (10) must succeed.
    assert.equal(rl.tryConsume(10, 10000), true);
  });
});
