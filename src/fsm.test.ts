import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FiniteStateMachine, InvalidTransitionError } from "./fsm.ts";

type S = "idle" | "running" | "done";
type E = "start" | "finish";

test("FiniteStateMachine: constructs without throwing", () => {
  const t: Record<S, Record<E, S>> = {
    idle:    { start: "running", finish: "idle" },
    running: { start: "running", finish: "done" },
    done:    { start: "done",    finish: "done" },
  };
  const m = new FiniteStateMachine<S, E>("idle", t);
  assert.ok(m);
});

describe("FiniteStateMachine: acceptance criteria", () => {
  const transitions: Record<S, Partial<Record<E, S>>> = {
    idle:    { start: "running" },
    running: { finish: "done" },
    done:    {},
  };

  type E2 = "start" | "finish";

  test(".state getter returns the current state", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    assert.equal(m.state, "idle");
  });

  test(".transition(event) updates state on valid transition", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    m.transition("start");
    assert.equal(m.state, "running");
  });

  test(".transition(event) throws InvalidTransitionError on invalid transition", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    // "finish" is not defined for "idle"
    assert.throws(
      () => m.transition("finish"),
      (err: unknown) => {
        assert.ok(err instanceof InvalidTransitionError, "expected InvalidTransitionError");
        return true;
      }
    );
  });

  test(".canTransition(event) returns true for defined transitions", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    assert.equal(m.canTransition("start"), true);
  });

  test(".canTransition(event) returns false for undefined transitions", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    assert.equal(m.canTransition("finish"), false);
  });

  test(".canTransition(event) does not mutate state", () => {
    const m = new FiniteStateMachine<S, E2>("idle", transitions as Record<S, Record<E2, S>>);
    m.canTransition("start");
    assert.equal(m.state, "idle");
  });
});
