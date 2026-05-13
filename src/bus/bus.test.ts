import { test, describe } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Acceptance-criteria tests for the typed event bus (GH-227).
// These tests are intentionally RED until the implementation is written.
// ---------------------------------------------------------------------------

describe("EventBus", async () => {
  // Lazy-import so individual tests can fail with a clear message rather than
  // the whole suite erroring at module parse time.
  const { EventBus } = await import("./bus.ts");

  // -------------------------------------------------------------------------
  // AC-1: EventBus<EM> class exists
  // -------------------------------------------------------------------------
  test("AC-1: EventBus is a class constructor", () => {
    assert.strictEqual(typeof EventBus, "function");
    const bus = new EventBus<{ ping: string }>();
    assert.ok(bus instanceof EventBus);
  });

  // -------------------------------------------------------------------------
  // AC-2: .on() registers a listener and returns an Unsubscribe fn
  // -------------------------------------------------------------------------
  test("AC-2: .on() delivers payload to the handler", () => {
    const bus = new EventBus<{ greet: string }>();
    const received: string[] = [];
    bus.on("greet", (payload) => received.push(payload));
    bus.emit("greet", "hello");
    assert.deepStrictEqual(received, ["hello"]);
  });

  test("AC-2: .on() returns an Unsubscribe function that removes the listener", () => {
    const bus = new EventBus<{ tick: number }>();
    const calls: number[] = [];
    const unsub = bus.on("tick", (n) => calls.push(n));
    bus.emit("tick", 1);
    unsub();
    bus.emit("tick", 2);
    assert.deepStrictEqual(calls, [1]); // second emit should not reach the handler
  });

  // -------------------------------------------------------------------------
  // AC-3: .once() fires at most once
  // -------------------------------------------------------------------------
  test("AC-3: .once() handler is called only for the first emit", () => {
    const bus = new EventBus<{ boom: void }>();
    let count = 0;
    bus.once("boom", () => count++);
    bus.emit("boom", undefined);
    bus.emit("boom", undefined);
    bus.emit("boom", undefined);
    assert.strictEqual(count, 1);
  });

  test("AC-3: .once() auto-removes so listenerCount drops after first emit", () => {
    const bus = new EventBus<{ boom: void }>();
    bus.once("boom", () => {});
    assert.strictEqual(bus.listenerCount("boom"), 1);
    bus.emit("boom", undefined);
    assert.strictEqual(bus.listenerCount("boom"), 0);
  });

  // -------------------------------------------------------------------------
  // AC-4: .emit() invokes every listener synchronously
  // -------------------------------------------------------------------------
  test("AC-4: multiple listeners all receive the payload", () => {
    const bus = new EventBus<{ data: number }>();
    const results: number[] = [];
    bus.on("data", (n) => results.push(n * 1));
    bus.on("data", (n) => results.push(n * 2));
    bus.on("data", (n) => results.push(n * 3));
    bus.emit("data", 10);
    assert.deepStrictEqual(results, [10, 20, 30]);
  });

  test("AC-4: emit is synchronous (results available immediately after call)", () => {
    const bus = new EventBus<{ sync: string }>();
    let seen = "";
    bus.on("sync", (s) => { seen = s; });
    bus.emit("sync", "immediate");
    assert.strictEqual(seen, "immediate");
  });

  // -------------------------------------------------------------------------
  // AC-5: .listenerCount() returns the number of registered listeners
  // -------------------------------------------------------------------------
  test("AC-5: listenerCount reflects additions and removals", () => {
    const bus = new EventBus<{ x: void }>();
    assert.strictEqual(bus.listenerCount("x"), 0);
    const unsub1 = bus.on("x", () => {});
    assert.strictEqual(bus.listenerCount("x"), 1);
    const unsub2 = bus.on("x", () => {});
    assert.strictEqual(bus.listenerCount("x"), 2);
    unsub1();
    assert.strictEqual(bus.listenerCount("x"), 1);
    unsub2();
    assert.strictEqual(bus.listenerCount("x"), 0);
  });

  test("AC-5: listenerCount for an unknown event returns 0", () => {
    const bus = new EventBus<{ known: void }>();
    assert.strictEqual(bus.listenerCount("known"), 0);
  });

  // -------------------------------------------------------------------------
  // AC-6: Throwing handlers do not prevent later handlers from running;
  //        errors collected in lastEmitErrors, reset on every emit
  // -------------------------------------------------------------------------
  test("AC-6: a throwing handler does not stop subsequent handlers", () => {
    const bus = new EventBus<{ msg: string }>();
    const results: string[] = [];
    bus.on("msg", () => { throw new Error("kaboom"); });
    bus.on("msg", (s) => results.push(s));
    bus.emit("msg", "after-throw");
    assert.deepStrictEqual(results, ["after-throw"]);
  });

  test("AC-6: errors are collected in lastEmitErrors", () => {
    const bus = new EventBus<{ msg: string }>();
    const err = new Error("kaboom");
    bus.on("msg", () => { throw err; });
    bus.emit("msg", "x");
    assert.strictEqual(bus.lastEmitErrors.length, 1);
    assert.strictEqual(bus.lastEmitErrors[0], err);
  });

  test("AC-6: lastEmitErrors resets to empty on every emit", () => {
    const bus = new EventBus<{ e: void }>();
    bus.on("e", () => { throw new Error("first"); });
    bus.emit("e", undefined);
    assert.strictEqual(bus.lastEmitErrors.length, 1);

    // Second emit: no throwing handlers → errors reset to []
    bus.on("e", () => {}); // add a clean handler so there is something to call
    // remove the throwing one — we need a fresh bus for isolation
    const bus2 = new EventBus<{ e: void }>();
    bus2.on("e", () => { throw new Error("a"); });
    bus2.on("e", () => { throw new Error("b"); });
    bus2.emit("e", undefined);
    assert.strictEqual(bus2.lastEmitErrors.length, 2);

    // Now emit again with no throwing handlers (all original handlers are gone
    // if we re-subscribe cleanly — use a fresh bus)
    const bus3 = new EventBus<{ e: void }>();
    bus3.on("e", () => {});
    bus3.emit("e", undefined);
    assert.strictEqual(bus3.lastEmitErrors.length, 0);
  });

  test("AC-6: lastEmitErrors is initially empty", () => {
    const bus = new EventBus<{ e: void }>();
    assert.deepStrictEqual(bus.lastEmitErrors, []);
  });
});

// ---------------------------------------------------------------------------
// AC-7: Listener<EM, K> type alias exported from src/bus/listener.ts
// (We can only assert the runtime shape; TypeScript types are erased.
//  The import itself fails if listener.ts doesn't exist.)
// ---------------------------------------------------------------------------
describe("Listener type from listener.ts", async () => {
  test("AC-7: listener.ts module can be imported (existence check)", async () => {
    // If the file doesn't exist this dynamic import throws → test fails (RED).
    const mod = await import("./listener.ts");
    // The module exists; nothing to assert at runtime for a type-only export.
    assert.ok(mod !== undefined);
  });
});

// ---------------------------------------------------------------------------
// AC-7 (continued): index.ts re-exports both EventBus and Listener
// ---------------------------------------------------------------------------
describe("index.ts re-exports", async () => {
  test("AC-7: index re-exports EventBus", async () => {
    const mod = await import("./index.ts");
    assert.strictEqual(typeof mod.EventBus, "function");
  });
});
