import { test } from "node:test";
import assert from "node:assert/strict";
import { FiniteStateMachine } from "./fsm.ts";

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
