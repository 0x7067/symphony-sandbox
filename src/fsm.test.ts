import { test } from "node:test";
import assert from "node:assert/strict";
import { FiniteStateMachine } from "./fsm.ts";

type S = "idle" | "running" | "done";
type E = "start" | "finish";

const transitions = {
  idle:    { start: "running" as S },
  running: { finish: "done" as S },
  done:    {},
} as Record<S, Record<E, S>>;

test("FiniteStateMachine: constructs without throwing", () => {
  const t: Record<S, Record<E, S>> = {
    idle:    { start: "running", finish: "idle" },
    running: { start: "running", finish: "done" },
    done:    { start: "done",    finish: "done" },
  };
  const m = new FiniteStateMachine<S, E>("idle", t);
  assert.ok(m);
});

test("FiniteStateMachine: .state getter returns initial state", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  // @ts-ignore — state getter not yet implemented
  assert.equal(m.state, "idle");
});

test("FiniteStateMachine: valid transition updates .state", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  m.transition("start");
  // @ts-ignore — state getter not yet implemented
  assert.equal(m.state, "running");
});

test("FiniteStateMachine: invalid transition throws InvalidTransitionError", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  // "finish" has no entry for "idle" — must throw
  assert.throws(
    () => m.transition("finish"),
    (err: unknown) => {
      assert.ok(err instanceof Error, "must throw an Error");
      assert.equal((err as Error).constructor.name, "InvalidTransitionError");
      return true;
    }
  );
});

test("FiniteStateMachine: canTransition returns true for valid event", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  // @ts-ignore — canTransition not yet implemented
  assert.equal(m.canTransition("start"), true);
});

test("FiniteStateMachine: canTransition returns false for invalid event", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  // @ts-ignore — canTransition not yet implemented
  assert.equal(m.canTransition("finish"), false);
});

test("FiniteStateMachine: canTransition does not mutate state", () => {
  const m = new FiniteStateMachine<S, E>("idle", transitions);
  // @ts-ignore — canTransition not yet implemented
  m.canTransition("start");
  // @ts-ignore — state getter not yet implemented
  assert.equal(m.state, "idle");
});
