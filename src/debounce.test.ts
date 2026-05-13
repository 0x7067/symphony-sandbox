import { test } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "./debounce.ts";

test("debounce: function is callable", () => {
  const d = debounce(() => {}, 10);
  assert.ok(d);
});

test("debounce: fires exactly once after rapid calls (no timer leak)", (t, done) => {
  let callCount = 0;
  const d = debounce(() => { callCount++; }, 50);

  // trigger() must exist on the returned object
  assert.equal(typeof d.trigger, "function", "returned object must have trigger()");

  // Rapid-fire 5 calls — only the last should produce one invocation
  d.trigger();
  d.trigger();
  d.trigger();
  d.trigger();
  d.trigger();

  // Wait long enough for all timers to have fired
  setTimeout(() => {
    assert.equal(callCount, 1, "debounced fn should fire exactly once, not once per call");
    done();
  }, 200);
});

test("debounce: cancel() prevents pending invocation", (t, done) => {
  let callCount = 0;
  const d = debounce(() => { callCount++; }, 50);

  assert.equal(typeof d.cancel, "function", "returned object must have cancel()");

  d.trigger();
  d.cancel();

  setTimeout(() => {
    assert.equal(callCount, 0, "cancel() should prevent the fn from firing");
    done();
  }, 150);
});
