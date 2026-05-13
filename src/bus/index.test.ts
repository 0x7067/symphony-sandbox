import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { EventBus } from "./index.ts";

// Existing baseline — must stay green.
test("bus index: module loads", async () => {
  await import("./index.ts");
  assert.ok(true);
});

// AC1 – EventBus class is exported from the barrel
test("AC1: EventBus is exported from index.ts", async () => {
  const mod = await import("./index.ts") as Record<string, unknown>;
  assert.ok(
    typeof mod.EventBus === "function",
    `expected EventBus to be a constructor, got ${typeof mod.EventBus}`,
  );
});

// AC2 – .on(event, handler) registers a listener; returns an Unsubscribe fn
describe("AC2 – .on", () => {
  test("calls the handler when the matching event is emitted", () => {
    const bus = new EventBus<{ ping: string }>();
    const received: string[] = [];
    bus.on("ping", (p) => received.push(p));
    bus.emit("ping", "hello");
    assert.deepEqual(received, ["hello"]);
  });

  test("does NOT call the handler for a different event", () => {
    const bus = new EventBus<{ a: number; b: number }>();
    let called = false;
    bus.on("b", () => { called = true; });
    bus.emit("a", 1);
    assert.equal(called, false);
  });

  test("returns an unsubscribe function that stops future calls", () => {
    const bus = new EventBus<{ ping: string }>();
    const received: string[] = [];
    const unsub = bus.on("ping", (p) => received.push(p));
    assert.equal(typeof unsub, "function", "on() must return an unsubscribe function");
    unsub();
    bus.emit("ping", "hello");
    assert.deepEqual(received, [], "handler must not be called after unsubscribe");
  });
});

// AC3 – .once(event, handler) fires at most once then auto-removes
describe("AC3 – .once", () => {
  test("fires the handler exactly once across multiple emits", () => {
    const bus = new EventBus<{ tick: number }>();
    const calls: number[] = [];
    bus.once("tick", (n) => calls.push(n));
    bus.emit("tick", 1);
    bus.emit("tick", 2);
    assert.deepEqual(calls, [1]);
  });

  test("auto-removes: listenerCount drops to 0 after the first emit", () => {
    const bus = new EventBus<{ tick: number }>();
    bus.once("tick", () => {});
    assert.equal(bus.listenerCount("tick"), 1);
    bus.emit("tick", 42);
    assert.equal(bus.listenerCount("tick"), 0);
  });
});

// AC4 – .emit synchronously calls ALL listeners for the event
describe("AC4 – .emit", () => {
  test("calls multiple listeners in registration order", () => {
    const bus = new EventBus<{ msg: string }>();
    const log: string[] = [];
    bus.on("msg", (s) => log.push("a:" + s));
    bus.on("msg", (s) => log.push("b:" + s));
    bus.emit("msg", "x");
    assert.deepEqual(log, ["a:x", "b:x"]);
  });
});

// AC5 – .listenerCount(event)
describe("AC5 – .listenerCount", () => {
  test("returns 0 when no listeners are registered", () => {
    const bus = new EventBus<{ x: number }>();
    assert.equal(bus.listenerCount("x"), 0);
  });

  test("reflects additions and removals accurately", () => {
    const bus = new EventBus<{ x: number }>();
    const unsub1 = bus.on("x", () => {});
    const unsub2 = bus.on("x", () => {});
    assert.equal(bus.listenerCount("x"), 2);
    unsub1();
    assert.equal(bus.listenerCount("x"), 1);
    unsub2();
    assert.equal(bus.listenerCount("x"), 0);
  });
});

// AC6 – error isolation
describe("AC6 – error isolation", () => {
  test("later handlers still run when an earlier handler throws", () => {
    const bus = new EventBus<{ e: string }>();
    const log: string[] = [];
    bus.on("e", () => { throw new Error("boom"); });
    bus.on("e", (s) => log.push(s));
    bus.emit("e", "after");
    assert.deepEqual(log, ["after"]);
  });

  test("thrown errors are collected in .lastEmitErrors", () => {
    const bus = new EventBus<{ e: string }>();
    const err = new Error("boom");
    bus.on("e", () => { throw err; });
    bus.emit("e", "x");
    assert.equal(bus.lastEmitErrors.length, 1);
    assert.strictEqual(bus.lastEmitErrors[0], err);
  });

  test(".lastEmitErrors resets to [] at the start of each emit", () => {
    const bus = new EventBus<{ e: string }>();
    bus.on("e", () => { throw new Error("boom"); });
    bus.emit("e", "1");
    assert.equal(bus.lastEmitErrors.length, 1);
    // Same handler fires again — must be exactly 1, not accumulated.
    bus.emit("e", "2");
    assert.equal(bus.lastEmitErrors.length, 1, ".lastEmitErrors must reset each emit, not accumulate");

    // No handlers → must reset to [].
    const bus2 = new EventBus<{ e: string }>();
    bus2.emit("e", "clean");
    assert.deepEqual(bus2.lastEmitErrors, []);
  });
});

// AC7 – Listener<EM, K> type alias exported from listener.ts; re-exported from index.ts
describe("AC7 – Listener type alias", () => {
  test("listener.ts module exists and loads without error", async () => {
    const mod = await import("./listener.ts");
    assert.ok(mod !== undefined);
  });

  test("index.ts re-exports EventBus (barrel completeness)", async () => {
    const mod = await import("./index.ts") as Record<string, unknown>;
    assert.ok("EventBus" in mod, "index.ts must re-export EventBus");
  });
});
