import { test, describe } from "node:test";
import assert from "node:assert/strict";
import type {
  Flag,
  PercentageRule,
  AttributeRule,
  SegmentRule,
  Context,
} from "./index.ts";
import {
  FlagRegistry,
  evaluate,
  defineSegment,
  getSegment,
  auditLog,
  serialize,
  parseRegistry,
  RegistryError,
  InvalidFlagError,
  EvaluationError,
  ParseError,
} from "./index.ts";

// ---------------------------------------------------------------------------
// 1. FlagRegistry — register, retrieve, list all
// ---------------------------------------------------------------------------
describe("FlagRegistry", () => {
  test("can be constructed", () => {
    const registry = new FlagRegistry();
    assert.ok(registry instanceof FlagRegistry);
  });

  test("register and retrieve a flag by name", () => {
    const registry = new FlagRegistry();
    const flag: Flag<boolean> = { name: "my-flag", defaultValue: false, rules: [] };
    registry.register(flag);
    assert.deepEqual(registry.get("my-flag"), flag);
  });

  test("listAll returns every registered flag", () => {
    const registry = new FlagRegistry();
    const a: Flag<boolean> = { name: "list-a", defaultValue: true, rules: [] };
    const b: Flag<string> = { name: "list-b", defaultValue: "x", rules: [] };
    registry.register(a);
    registry.register(b);
    const all = registry.listAll();
    assert.equal(all.length, 2);
    assert.ok(all.some((f) => f.name === "list-a"));
    assert.ok(all.some((f) => f.name === "list-b"));
  });

  test("get returns undefined for an unknown name", () => {
    const registry = new FlagRegistry();
    assert.equal(registry.get("__unknown__"), undefined);
  });
});

// ---------------------------------------------------------------------------
// 2 & 3. Flag<T> shape and Rule<T> union
// ---------------------------------------------------------------------------
describe("Flag and Rule shapes", () => {
  test("PercentageRule carries kind/id/percentage/value", () => {
    const rule: PercentageRule<string> = {
      kind: "percentage", id: "p1", percentage: 50, value: "treatment",
    };
    assert.equal(rule.kind, "percentage");
    assert.equal(rule.id, "p1");
    assert.equal(rule.percentage, 50);
    assert.equal(rule.value, "treatment");
  });

  test("AttributeRule carries kind/id/attribute/expected/value", () => {
    const rule: AttributeRule<boolean> = {
      kind: "attribute", id: "a1", attribute: "country", expected: "US", value: true,
    };
    assert.equal(rule.kind, "attribute");
    assert.equal(rule.attribute, "country");
    assert.equal(rule.expected, "US");
  });

  test("SegmentRule carries kind/id/segment/value", () => {
    const rule: SegmentRule<number> = {
      kind: "segment", id: "s1", segment: "beta", value: 42,
    };
    assert.equal(rule.kind, "segment");
    assert.equal(rule.segment, "beta");
    assert.equal(rule.value, 42);
  });
});

// ---------------------------------------------------------------------------
// 4. evaluate — pure function, first-match wins
// ---------------------------------------------------------------------------
describe("evaluate", () => {
  test("returns defaultValue when rules list is empty", () => {
    const flag: Flag<string> = { name: "ev-empty", defaultValue: "default", rules: [] };
    assert.equal(evaluate(flag, { key: "u1", attributes: {} }), "default");
  });

  test("AttributeRule matches when the attribute equals expected", () => {
    const flag: Flag<string> = {
      name: "ev-attr",
      defaultValue: "off",
      rules: [{ kind: "attribute", id: "r1", attribute: "plan", expected: "pro", value: "on" }],
    };
    assert.equal(evaluate(flag, { key: "u", attributes: { plan: "pro" } }), "on");
    assert.equal(evaluate(flag, { key: "u", attributes: { plan: "free" } }), "off");
  });

  test("first matching rule wins; later rules are not evaluated", () => {
    const flag: Flag<string> = {
      name: "ev-order",
      defaultValue: "none",
      rules: [
        { kind: "attribute", id: "r1", attribute: "role", expected: "admin", value: "first" },
        { kind: "attribute", id: "r2", attribute: "role", expected: "admin", value: "second" },
      ],
    };
    assert.equal(evaluate(flag, { key: "u", attributes: { role: "admin" } }), "first");
  });

  // ------------------------------------------------------------------
  // PercentageRule must use a STABLE HASH — not Math.random
  // ------------------------------------------------------------------

  test("PercentageRule: Math.random is NEVER called (must use stable hash)", () => {
    const original = Math.random;
    let callCount = 0;
    Math.random = () => { callCount++; return original(); };
    try {
      const flag: Flag<string> = {
        name: "pct-no-rng",
        defaultValue: "ctrl",
        rules: [{ kind: "percentage", id: "r", percentage: 50, value: "treat" }],
      };
      // Fresh key — no memoization can save a Math.random impl here
      evaluate(flag, { key: "fresh-unique-key-no-rng-xq7z9", attributes: {} });
      assert.equal(callCount, 0, "PercentageRule must not call Math.random");
    } finally {
      Math.random = original;
    }
  });

  test("PercentageRule is stable: same key always returns the same value", () => {
    const flag: Flag<string> = {
      name: "pct-stable",
      defaultValue: "ctrl",
      rules: [{ kind: "percentage", id: "r", percentage: 50, value: "treat" }],
    };
    const ctx: Context = { key: "deterministic-key-abc", attributes: {} };
    const first = evaluate(flag, ctx);
    for (let i = 0; i < 30; i++) {
      assert.equal(evaluate(flag, ctx), first, `call ${i} must match first result`);
    }
  });

  test("PercentageRule at 100% matches every key", () => {
    const flag: Flag<string> = {
      name: "pct-100",
      defaultValue: "never",
      rules: [{ kind: "percentage", id: "r", percentage: 100, value: "always" }],
    };
    for (const key of ["a", "b", "z", "user-999", "🔑"]) {
      assert.equal(evaluate(flag, { key, attributes: {} }), "always", `key "${key}" must match`);
    }
  });

  test("PercentageRule at 0% matches no key", () => {
    const flag: Flag<string> = {
      name: "pct-0",
      defaultValue: "default",
      rules: [{ kind: "percentage", id: "r", percentage: 0, value: "never" }],
    };
    for (const key of ["a", "b", "z", "user-999", "🔑"]) {
      assert.equal(evaluate(flag, { key, attributes: {} }), "default", `key "${key}" must not match`);
    }
  });

  test("SegmentRule matches when segment predicate returns true", () => {
    defineSegment("gold-tier", (ctx) => ctx.attributes["tier"] === "gold");
    const flag: Flag<boolean> = {
      name: "ev-seg",
      defaultValue: false,
      rules: [{ kind: "segment", id: "r", segment: "gold-tier", value: true }],
    };
    assert.equal(evaluate(flag, { key: "u1", attributes: { tier: "gold" } }), true);
    assert.equal(evaluate(flag, { key: "u2", attributes: { tier: "silver" } }), false);
  });
});

// ---------------------------------------------------------------------------
// 5. Segments
// ---------------------------------------------------------------------------
describe("Segments", () => {
  test("defineSegment / getSegment round-trip", () => {
    defineSegment("seg-rt", () => true);
    const seg = getSegment("seg-rt");
    assert.ok(seg);
    assert.equal(seg!.name, "seg-rt");
  });

  test("segment predicate is invoked and returns correct boolean", () => {
    defineSegment("seg-pred", (ctx) => ctx.attributes["x"] === 1);
    const seg = getSegment("seg-pred");
    assert.ok(seg);
    assert.equal(seg!.predicate({ key: "u", attributes: { x: 1 } }), true);
    assert.equal(seg!.predicate({ key: "u", attributes: { x: 2 } }), false);
  });

  test("getSegment returns undefined for unknown name", () => {
    assert.equal(getSegment("__no-such-segment__"), undefined);
  });
});

// ---------------------------------------------------------------------------
// 6. Audit log — ring buffer capped at 1000, auditLog(limit?) returns latest
// ---------------------------------------------------------------------------
describe("auditLog", () => {
  test("evaluate appends one entry with the required fields", () => {
    const flag: Flag<string> = { name: "audit-shape", defaultValue: "v", rules: [] };
    const before = auditLog().length;
    evaluate(flag, { key: "audit-u", attributes: { z: "1" } });
    const log = auditLog();
    assert.equal(log.length, before + 1, "exactly one entry must be appended per evaluate call");
    const entry = log[log.length - 1];
    assert.equal(entry.flagName, "audit-shape");
    assert.ok("contextSnapshot" in entry);
    assert.ok("matchedRuleId" in entry);
    assert.ok("value" in entry);
    assert.equal(typeof entry.timestampMs, "number");
  });

  test("auditLog(limit) returns at most <limit> entries", () => {
    const flag: Flag<number> = { name: "al-limit", defaultValue: 0, rules: [] };
    for (let i = 0; i < 10; i++) evaluate(flag, { key: `k${i}`, attributes: {} });
    assert.ok(auditLog(3).length <= 3);
    assert.ok(auditLog(1).length <= 1);
  });

  test("auditLog(limit) returns the LATEST entries, not the oldest", () => {
    // Add several entries under a forgettable flag name, then one canary at the very end.
    const filler: Flag<number> = { name: "al-filler", defaultValue: 0, rules: [] };
    for (let i = 0; i < 5; i++) evaluate(filler, { key: `f${i}`, attributes: {} });
    const canary: Flag<string> = { name: "al-canary", defaultValue: "c", rules: [] };
    evaluate(canary, { key: "canary-key", attributes: {} });

    // With limit=1 we must get the canary (the most recent), not the oldest filler entry.
    const [latest] = auditLog(1);
    assert.equal(latest.flagName, "al-canary",
      "auditLog(1) must return the most recent entry, not the oldest");
  });

  test("ring buffer caps at 1000 — never grows beyond that", () => {
    const flag: Flag<number> = { name: "al-ring", defaultValue: 1, rules: [] };
    for (let i = 0; i < 1100; i++) evaluate(flag, { key: `r${i}`, attributes: {} });
    const len = auditLog().length;
    assert.ok(len <= 1000, `ring buffer must cap at 1000, got ${len}`);
  });
});

// ---------------------------------------------------------------------------
// 7. serialize / parseRegistry round-trip and error handling
// ---------------------------------------------------------------------------
describe("serialize and parseRegistry", () => {
  test("serialize returns a JSON string", () => {
    const r = new FlagRegistry();
    const s = serialize(r);
    assert.equal(typeof s, "string");
    assert.doesNotThrow(() => JSON.parse(s));
  });

  test("round-trip preserves flag name, defaultValue, and rules", () => {
    const r = new FlagRegistry();
    r.register({
      name: "rt-flag",
      defaultValue: "off",
      rules: [{ kind: "attribute", id: "rt-r1", attribute: "env", expected: "prod", value: "on" }],
    } as Flag<string>);
    const restored = parseRegistry(serialize(r));
    assert.ok(restored instanceof FlagRegistry);
    const f = restored.get("rt-flag") as Flag<string>;
    assert.ok(f, "rt-flag must survive the round-trip");
    assert.equal(f.name, "rt-flag");
    assert.equal(f.defaultValue, "off");
    assert.equal(f.rules.length, 1);
    assert.equal((f.rules[0] as AttributeRule<string>).attribute, "env");
  });

  test("parseRegistry throws ParseError on malformed JSON", () => {
    assert.throws(
      () => parseRegistry("{ not valid json !!!"),
      (err: unknown) => err instanceof ParseError,
    );
  });

  test("parseRegistry throws ParseError when root is null", () => {
    assert.throws(
      () => parseRegistry(JSON.stringify(null)),
      (err: unknown) => err instanceof ParseError,
    );
  });

  test("parseRegistry throws ParseError when root is a plain array", () => {
    assert.throws(
      () => parseRegistry(JSON.stringify(["a", "b"])),
      (err: unknown) => err instanceof ParseError,
    );
  });

  test("parseRegistry throws ParseError when flags list is not an array", () => {
    assert.throws(
      () => parseRegistry(JSON.stringify({ flags: "oops" })),
      (err: unknown) => err instanceof ParseError,
    );
  });
});

// ---------------------------------------------------------------------------
// 8. Typed errors — distinct, constructable, extend Error
// ---------------------------------------------------------------------------
describe("Typed errors", () => {
  test("RegistryError is an Error with the supplied message", () => {
    const e = new RegistryError("reg");
    assert.ok(e instanceof Error);
    assert.ok(e instanceof RegistryError);
    assert.equal(e.message, "reg");
  });

  test("InvalidFlagError is an Error with the supplied message", () => {
    const e = new InvalidFlagError("inv");
    assert.ok(e instanceof Error);
    assert.ok(e instanceof InvalidFlagError);
    assert.equal(e.message, "inv");
  });

  test("EvaluationError is an Error with the supplied message", () => {
    const e = new EvaluationError("eval");
    assert.ok(e instanceof Error);
    assert.ok(e instanceof EvaluationError);
    assert.equal(e.message, "eval");
  });

  test("ParseError is an Error with the supplied message", () => {
    const e = new ParseError("parse");
    assert.ok(e instanceof Error);
    assert.ok(e instanceof ParseError);
    assert.equal(e.message, "parse");
  });

  test("error classes are four distinct constructors", () => {
    const ctors = [RegistryError, InvalidFlagError, EvaluationError, ParseError];
    for (let i = 0; i < ctors.length; i++) {
      for (let j = i + 1; j < ctors.length; j++) {
        assert.notEqual(ctors[i], ctors[j],
          `${ctors[i].name} and ${ctors[j].name} must not be the same constructor`);
      }
    }
  });

  test("error instances are not cross-instanceof", () => {
    assert.ok(!(new RegistryError("x") instanceof ParseError));
    assert.ok(!(new ParseError("x") instanceof RegistryError));
    assert.ok(!(new InvalidFlagError("x") instanceof EvaluationError));
  });
});
