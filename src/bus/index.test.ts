import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Helper: import the barrel and pull out EventBus each time so we get a fresh
// instance. Using dynamic import inside each test keeps them independent and
// means the import failure (if any) is a genuine per-test failure.
// ---------------------------------------------------------------------------
async function getBus() {
  // Always import the barrel — that's what consumers will use.
  const mod = await import("./index.ts");
  // mod.EventBus will be undefined until the class is exported; every test
  // that calls `new Bus()` will throw TypeError, causing the test to fail.
  const Bus = (mod as Record<string, unknown>).EventBus as (new () => unknown);
  return Bus;
}

// Existing baseline — must stay green.
test("bus index: module loads", async () => {
  await import("./index.ts");
  assert.ok(true);
});

// ---------------------------------------------------------------------------
// AC1 – EventBus class is exported from the barrel
// ---------------------------------------------------------------------------
test("AC1: EventBus is exported from index.ts", async () => {
  const mod = await import("./index.ts") as Record<string, unknown>;
  assert.ok(
    typeof mod.EventBus === "function",
    `expected EventBus to be a constructor, got ${typeof mod.EventBus}`,
  );
});

// ---------------------------------------------------------------------------
// AC2 – .on(event, handler) registers a listener; returns an Unsubscribe fn
// ---------------------------------------------------------------------------
describe("AC2 – .on", () => {
  test("calls the handler when the matching event is emitted", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function };
    const received: string[] = [];
    bus.on("ping", (p: string) => received.push(p));
    bus.emit("ping", "hello");
    assert.deepEqual(received, ["hello"]);
  });

  test("does NOT call the handler for a different event", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function };
    let called = false;
    bus.on("b", () => { called = true; });
    bus.emit("a", 1);
    assert.equal(called, false);
  });

  test("returns an unsubscribe function that stops future calls", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function };
    const received: string[] = [];
    const unsub = bus.on("ping", (p: string) => received.push(p));
    assert.equal(typeof unsub, "function", "on() must return an unsubscribe function");
    unsub();
    bus.emit("ping", "hello");
    assert.deepEqual(received, [], "handler must not be called after unsubscribe");
  });
});

// ---------------------------------------------------------------------------
// AC3 – .once(event, handler) fires at most once then auto-removes
// ---------------------------------------------------------------------------
describe("AC3 – .once", () => {
  test("fires the handler exactly once across multiple emits", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { once: Function; emit: Function };
    const calls: number[] = [];
    bus.once("tick", (n: number) => calls.push(n));
    bus.emit("tick", 1);
    bus.emit("tick", 2);
    assert.deepEqual(calls, [1]);
  });

  test("auto-removes: listenerCount drops to 0 after the first emit", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { once: Function; emit: Function; listenerCount: Function };
    bus.once("tick", () => {});
    assert.equal(bus.listenerCount("tick"), 1);
    bus.emit("tick", 42);
    assert.equal(bus.listenerCount("tick"), 0);
  });
});

// ---------------------------------------------------------------------------
// AC4 – .emit synchronously calls ALL listeners for the event
// ---------------------------------------------------------------------------
describe("AC4 – .emit", () => {
  test("calls multiple listeners in registration order", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function };
    const log: string[] = [];
    bus.on("msg", (s: string) => log.push("a:" + s));
    bus.on("msg", (s: string) => log.push("b:" + s));
    bus.emit("msg", "x");
    assert.deepEqual(log, ["a:x", "b:x"]);
  });
});

// ---------------------------------------------------------------------------
// AC5 – .listenerCount(event)
// ---------------------------------------------------------------------------
describe("AC5 – .listenerCount", () => {
  test("returns 0 when no listeners are registered", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { listenerCount: Function };
    assert.equal(bus.listenerCount("x"), 0);
  });

  test("reflects additions and removals accurately", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; listenerCount: Function };
    const unsub1 = bus.on("x", () => {});
    const unsub2 = bus.on("x", () => {});
    assert.equal(bus.listenerCount("x"), 2);
    unsub1();
    assert.equal(bus.listenerCount("x"), 1);
    unsub2();
    assert.equal(bus.listenerCount("x"), 0);
  });
});

// ---------------------------------------------------------------------------
// AC6 – error isolation: a throwing handler must not abort later handlers;
//        collected errors appear on .lastEmitErrors (reset each emit)
// ---------------------------------------------------------------------------
describe("AC6 – error isolation", () => {
  test("later handlers still run when an earlier handler throws", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function };
    const log: string[] = [];
    bus.on("e", () => { throw new Error("boom"); });
    bus.on("e", (s: string) => log.push(s));
    bus.emit("e", "after");
    assert.deepEqual(log, ["after"]);
  });

  test("thrown errors are collected in .lastEmitErrors", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function; lastEmitErrors: unknown[] };
    const err = new Error("boom");
    bus.on("e", () => { throw err; });
    bus.emit("e", "x");
    assert.equal(bus.lastEmitErrors.length, 1);
    assert.strictEqual(bus.lastEmitErrors[0], err);
  });

  test(".lastEmitErrors resets to [] at the start of each emit", async () => {
    const Bus = await getBus();
    const bus = new Bus() as { on: Function; emit: Function; lastEmitErrors: unknown[] };
    // First emit: 1 throwing handler → 1 error
    bus.on("e", () => { throw new Error("boom"); });
    bus.emit("e", "1");
    assert.equal(bus.lastEmitErrors.length, 1);
    // Second emit: same throwing handler fires again — errors must be exactly 1,
    // not accumulated from previous emits.
    bus.emit("e", "2");
    assert.equal(bus.lastEmitErrors.length, 1, ".lastEmitErrors must reset each emit, not accumulate");

    // After removing the throwing handler, a clean emit must yield [].
    const unsub = bus.on("e", () => { throw new Error("extra"); });
    unsub(); // immediately remove it
    bus.emit("e", "3"); // only the original throwing handler fires
    // Still 1 (original handler) but verify it reset from last time (not 2)
    assert.equal(bus.lastEmitErrors.length, 1);

    // Fully clean scenario: no handlers → lastEmitErrors must be []
    const bus2 = new Bus() as { emit: Function; lastEmitErrors: unknown[] };
    bus2.emit("e", "clean");
    assert.deepEqual(bus2.lastEmitErrors, []);
  });
});

// ---------------------------------------------------------------------------
// AC7 – Listener<EM, K> type alias exported from listener.ts; re-exported
//        from the barrel index.ts
// ---------------------------------------------------------------------------
describe("AC7 – Listener type alias", () => {
  test("listener.ts module exists and loads without error", async () => {
    // Will throw ERR_MODULE_NOT_FOUND until listener.ts is created.
    const mod = await import("./listener.ts");
    assert.ok(mod !== undefined);
  });

  test("index.ts re-exports EventBus (barrel completeness)", async () => {
    const mod = await import("./index.ts") as Record<string, unknown>;
    assert.ok("EventBus" in mod, "index.ts must re-export EventBus");
  });
});
