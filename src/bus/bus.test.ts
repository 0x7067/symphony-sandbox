import { test, describe } from "node:test";
import assert from "node:assert/strict";

// All imports are from the (not-yet-implemented) modules — these will fail until implemented.
import { EventBus } from "./bus.ts";
import type { Listener } from "./listener.ts";

type TestEvents = {
  greet: string;
  count: number;
  empty: undefined;
};

describe("EventBus", () => {
  // AC1: EventBus<EM> class can be instantiated with a typed event map
  test("AC1: EventBus is a class that can be instantiated", () => {
    const bus = new EventBus<TestEvents>();
    assert.ok(bus instanceof EventBus);
  });

  // AC2: .on(event, handler) registers a listener and returns an Unsubscribe function
  test("AC2: .on() registers a listener and invokes it on emit", () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];
    bus.on("greet", (payload) => received.push(payload));
    bus.emit("greet", "hello");
    assert.deepEqual(received, ["hello"]);
  });

  test("AC2: .on() returns an unsubscribe function that removes the listener", () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];
    const unsub = bus.on("greet", (payload) => received.push(payload));
    unsub();
    bus.emit("greet", "hello");
    assert.deepEqual(received, []);
  });

  test("AC2: multiple .on() listeners all fire on emit", () => {
    const bus = new EventBus<TestEvents>();
    const calls: number[] = [];
    bus.on("count", (n) => calls.push(n * 1));
    bus.on("count", (n) => calls.push(n * 2));
    bus.emit("count", 3);
    assert.deepEqual(calls, [3, 6]);
  });

  // AC3: .once(event, handler) fires at most once then auto-removes
  test("AC3: .once() handler is invoked on first emit", () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];
    bus.once("greet", (payload) => received.push(payload));
    bus.emit("greet", "first");
    assert.deepEqual(received, ["first"]);
  });

  test("AC3: .once() handler is NOT invoked on subsequent emits", () => {
    const bus = new EventBus<TestEvents>();
    const received: string[] = [];
    bus.once("greet", (payload) => received.push(payload));
    bus.emit("greet", "first");
    bus.emit("greet", "second");
    assert.deepEqual(received, ["first"]);
  });

  test("AC3: .once() auto-removes so listenerCount drops after first emit", () => {
    const bus = new EventBus<TestEvents>();
    bus.once("greet", () => {});
    assert.equal(bus.listenerCount("greet"), 1);
    bus.emit("greet", "hi");
    assert.equal(bus.listenerCount("greet"), 0);
  });

  // AC4: .emit(event, payload) synchronously invokes every registered listener
  test("AC4: .emit() is synchronous — all listeners run before emit returns", () => {
    const bus = new EventBus<TestEvents>();
    let called = false;
    bus.on("greet", () => { called = true; });
    bus.emit("greet", "sync");
    assert.equal(called, true);
  });

  test("AC4: .emit() passes the correct payload to listeners", () => {
    const bus = new EventBus<TestEvents>();
    let received: number | undefined;
    bus.on("count", (n) => { received = n; });
    bus.emit("count", 42);
    assert.equal(received, 42);
  });

  // AC5: .listenerCount(event) returns the number of currently-registered listeners
  test("AC5: .listenerCount() returns 0 when no listeners registered", () => {
    const bus = new EventBus<TestEvents>();
    assert.equal(bus.listenerCount("greet"), 0);
  });

  test("AC5: .listenerCount() increments with each .on()", () => {
    const bus = new EventBus<TestEvents>();
    bus.on("greet", () => {});
    assert.equal(bus.listenerCount("greet"), 1);
    bus.on("greet", () => {});
    assert.equal(bus.listenerCount("greet"), 2);
  });

  test("AC5: .listenerCount() decrements after unsubscribe", () => {
    const bus = new EventBus<TestEvents>();
    const unsub = bus.on("greet", () => {});
    assert.equal(bus.listenerCount("greet"), 1);
    unsub();
    assert.equal(bus.listenerCount("greet"), 0);
  });

  test("AC5: .listenerCount() is per-event (different events are independent)", () => {
    const bus = new EventBus<TestEvents>();
    bus.on("greet", () => {});
    bus.on("greet", () => {});
    bus.on("count", () => {});
    assert.equal(bus.listenerCount("greet"), 2);
    assert.equal(bus.listenerCount("count"), 1);
  });

  // AC6: Throwing in one handler must not prevent later handlers from running
  test("AC6: a throwing handler does not stop subsequent handlers from running", () => {
    const bus = new EventBus<TestEvents>();
    const calls: string[] = [];
    bus.on("greet", () => { throw new Error("boom"); });
    bus.on("greet", () => calls.push("second"));
    bus.emit("greet", "hi");
    assert.deepEqual(calls, ["second"]);
  });

  test("AC6: .lastEmitErrors contains errors thrown during emit", () => {
    const bus = new EventBus<TestEvents>();
    const err = new Error("boom");
    bus.on("greet", () => { throw err; });
    bus.emit("greet", "hi");
    assert.equal(bus.lastEmitErrors.length, 1);
    assert.equal(bus.lastEmitErrors[0], err);
  });

  test("AC6: .lastEmitErrors resets on every emit", () => {
    const bus = new EventBus<TestEvents>();
    bus.on("greet", () => { throw new Error("boom"); });
    bus.emit("greet", "first");
    assert.equal(bus.lastEmitErrors.length, 1);
    // Second emit with no throwing listeners — errors should be empty
    bus.on("count", () => {});
    bus.emit("count", 1);
    assert.equal(bus.lastEmitErrors.length, 0);
  });

  test("AC6: .lastEmitErrors is empty when no handlers throw", () => {
    const bus = new EventBus<TestEvents>();
    bus.on("greet", () => {});
    bus.emit("greet", "hi");
    assert.deepEqual(bus.lastEmitErrors, []);
  });
});

// AC7: Listener<EM, K> type alias — verify it can be used at runtime (import succeeds)
describe("Listener type alias", () => {
  test("AC7: listener.ts module can be imported", async () => {
    const mod = await import("./listener.ts");
    // The module exists and exports something (type aliases don't appear at runtime,
    // but the module itself must be importable without error)
    assert.ok(mod !== undefined);
  });

  test("AC7: a function typed as Listener<EM, K> is accepted by .on()", () => {
    const bus = new EventBus<TestEvents>();
    // If Listener type is correct, this assignment should compile.
    // At runtime we just verify it works end-to-end.
    const handler: Listener<TestEvents, "greet"> = (payload: string) => {
      assert.equal(typeof payload, "string");
    };
    bus.on("greet", handler);
    bus.emit("greet", "typed");
    assert.equal(bus.listenerCount("greet"), 1);
  });
});
