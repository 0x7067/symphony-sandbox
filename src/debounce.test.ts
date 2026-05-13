import { test } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./debounce.ts";

test("debounce: function is callable", () => {
  const d = debounce(() => {}, 10);
  assert.ok(d);
});

test("debounce: returns object with trigger() and cancel()", (t, done) => {
  let callCount = 0;
  const d = debounce(() => { callCount++; }, 50);

  // Must return a control object, not a plain function
  assert.strictEqual(typeof d, "object", "debounce() should return an object, not a function");
  assert.strictEqual(typeof d.trigger, "function", "returned object must have trigger()");
  assert.strictEqual(typeof d.cancel, "function", "returned object must have cancel()");

  // Rapid calls: trigger 3 times — fn should fire exactly ONCE
  d.trigger();
  d.trigger();
  d.trigger();

  setTimeout(() => {
    assert.strictEqual(callCount, 1, "fn should fire exactly once after rapid triggers (timer-leak bug)");

    // cancel() should prevent any pending invocation
    let cancelCount = 0;
    const d2 = debounce(() => { cancelCount++; }, 50);
    d2.trigger();
    d2.cancel();

    setTimeout(() => {
      assert.strictEqual(cancelCount, 0, "cancel() should prevent fn from firing");
      done();
    }, 100);
  }, 150);
});
