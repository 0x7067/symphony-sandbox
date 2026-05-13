/**
 * Feature-flags library — failing tests for all acceptance criteria.
 * These tests describe the EXPECTED behaviour; they fail today because
 * the implementation does not yet exist.
 */
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// AC 1 — FlagRegistry: register, retrieve, list
// ---------------------------------------------------------------------------
describe("AC1: FlagRegistry", () => {
  test("registers a flag and retrieves it by name", async () => {
    const { FlagRegistry } = await import("./index.ts");
    const registry = new FlagRegistry();
    const flag = { name: "dark-mode", defaultValue: false, rules: [] };
    registry.register(flag);
    assert.deepEqual(registry.get("dark-mode"), flag);
  });

  test("lists all registered flags", async () => {
    const { FlagRegistry } = await import("./index.ts");
    const registry = new FlagRegistry();
    registry.register({ name: "flag-a", defaultValue: 0, rules: [] });
    registry.register({ name: "flag-b", defaultValue: 1, rules: [] });
    const all = registry.list();
    assert.equal(all.length, 2);
    const names = all.map((f: { name: string }) => f.name).sort();
    assert.deepEqual(names, ["flag-a", "flag-b"]);
  });

  test("get returns undefined for an unknown flag name", async () => {
    const { FlagRegistry } = await import("./index.ts");
    const registry = new FlagRegistry();
    assert.equal(registry.get("unknown"), undefined);
  });
});

// ---------------------------------------------------------------------------
// AC 2 — Flag<T> shape
// ---------------------------------------------------------------------------
describe("AC2: Flag<T> shape", () => {
  test("flag object has name, defaultValue, and rules array", async () => {
    const { FlagRegistry } = await import("./index.ts");
    const registry = new FlagRegistry();
    const flag = { name: "my-flag", defaultValue: "off", rules: [] };
    registry.register(flag);
    const stored = registry.get("my-flag");
    assert.ok(stored, "flag should be stored");
    assert.equal(stored.name, "my-flag");
    assert.equal(stored.defaultValue, "off");
    assert.ok(Array.isArray(stored.rules));
  });
});

// ---------------------------------------------------------------------------
// AC 3 — Rule union: PercentageRule, AttributeRule, SegmentRule
// ---------------------------------------------------------------------------
describe("AC3: Rule types", () => {
  test("evaluate respects a PercentageRule with threshold 100 (always match)", async () => {
    const { FlagRegistry, evaluate } = await import("./index.ts");
    const registry = new FlagRegistry();
    const flag = {
      name: "pct-flag",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "percentage",
          percentage: 100,
          value: "on",
        },
      ],
    };
    registry.register(flag);
    const result = evaluate(flag, { bucketKey: "user-123" });
    assert.equal(result, "on");
  });

  test("evaluate respects a PercentageRule with threshold 0 (never match)", async () => {
    const { FlagRegistry, evaluate } = await import("./index.ts");
    const flag = {
      name: "pct-zero",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "percentage",
          percentage: 0,
          value: "on",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "user-123" });
    assert.equal(result, "off");
  });

  test("PercentageRule uses stable hashing (same key always yields same result)", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = {
      name: "stable-hash",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "percentage",
          percentage: 50,
          value: "on",
        },
      ],
    };
    const ctx = { bucketKey: "deterministic-user" };
    const first = evaluate(flag, ctx);
    const second = evaluate(flag, ctx);
    assert.equal(first, second, "same bucketKey must produce same result every time");
  });

  test("evaluate respects AttributeRule when attribute matches", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = {
      name: "attr-flag",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "attribute",
          attribute: "plan",
          value: "pro",
          returnValue: "on",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "u1", attributes: { plan: "pro" } });
    assert.equal(result, "on");
  });

  test("AttributeRule does not match when attribute differs", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = {
      name: "attr-miss",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "attribute",
          attribute: "plan",
          value: "pro",
          returnValue: "on",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "u1", attributes: { plan: "free" } });
    assert.equal(result, "off");
  });

  test("evaluate respects SegmentRule when context is in segment", async () => {
    const { evaluate, defineSegment } = await import("./index.ts");
    defineSegment("beta-testers", (ctx: { bucketKey: string; attributes?: Record<string, unknown> }) =>
      (ctx.attributes?.["beta"] as boolean) === true
    );
    const flag = {
      name: "seg-flag",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "segment",
          segment: "beta-testers",
          value: "on",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "u1", attributes: { beta: true } });
    assert.equal(result, "on");
  });

  test("SegmentRule does not match when context is outside segment", async () => {
    const { evaluate, defineSegment } = await import("./index.ts");
    defineSegment("vip", (ctx: { bucketKey: string; attributes?: Record<string, unknown> }) =>
      (ctx.attributes?.["vip"] as boolean) === true
    );
    const flag = {
      name: "seg-miss",
      defaultValue: "off",
      rules: [
        {
          id: "r1",
          kind: "segment",
          segment: "vip",
          value: "on",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "u1", attributes: { vip: false } });
    assert.equal(result, "off");
  });
});

// ---------------------------------------------------------------------------
// AC 4 — evaluate: first matching rule wins, else defaultValue
// ---------------------------------------------------------------------------
describe("AC4: evaluate", () => {
  test("returns defaultValue when no rules match", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = { name: "no-match", defaultValue: 42, rules: [] };
    assert.equal(evaluate(flag, { bucketKey: "u1" }), 42);
  });

  test("returns first matching rule value, not later ones", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = {
      name: "first-wins",
      defaultValue: "default",
      rules: [
        {
          id: "r1",
          kind: "attribute",
          attribute: "plan",
          value: "pro",
          returnValue: "first",
        },
        {
          id: "r2",
          kind: "attribute",
          attribute: "plan",
          value: "pro",
          returnValue: "second",
        },
      ],
    };
    const result = evaluate(flag, { bucketKey: "u1", attributes: { plan: "pro" } });
    assert.equal(result, "first");
  });

  test("evaluate is a pure function — no side effects on flag object", async () => {
    const { evaluate } = await import("./index.ts");
    const flag = { name: "pure", defaultValue: "x", rules: [] };
    const frozen = Object.freeze({ ...flag, rules: Object.freeze([]) });
    // Should not throw even on a frozen object
    assert.doesNotThrow(() => evaluate(frozen as typeof flag, { bucketKey: "u1" }));
  });
});

// ---------------------------------------------------------------------------
// AC 5 — Segments: defineSegment / getSegment
// ---------------------------------------------------------------------------
describe("AC5: Segments", () => {
  test("defineSegment stores a segment retrievable by getSegment", async () => {
    const { defineSegment, getSegment } = await import("./index.ts");
    const predicate = () => true;
    defineSegment("all-users", predicate);
    const seg = getSegment("all-users");
    assert.ok(seg, "segment should exist after defineSegment");
    assert.equal(seg.name, "all-users");
    assert.equal(typeof seg.predicate, "function");
  });

  test("getSegment returns undefined for unknown segment", async () => {
    const { getSegment } = await import("./index.ts");
    assert.equal(getSegment("nonexistent-segment-xyz"), undefined);
  });

  test("segment predicate is callable and returns boolean", async () => {
    const { defineSegment, getSegment } = await import("./index.ts");
    defineSegment("employees", (ctx: { bucketKey: string; attributes?: Record<string, unknown> }) =>
      String(ctx.bucketKey).endsWith("@acme.com")
    );
    const seg = getSegment("employees");
    assert.ok(seg);
    assert.equal(seg.predicate({ bucketKey: "alice@acme.com" }), true);
    assert.equal(seg.predicate({ bucketKey: "bob@example.com" }), false);
  });
});

// ---------------------------------------------------------------------------
// AC 6 — Audit log ring buffer
// ---------------------------------------------------------------------------
describe("AC6: Audit log", () => {
  test("auditLog returns entries after evaluate calls", async () => {
    const { evaluate, auditLog } = await import("./index.ts");
    const flag = { name: "audit-flag", defaultValue: "off", rules: [] };
    evaluate(flag, { bucketKey: "audit-user" });
    const entries = auditLog();
    assert.ok(entries.length >= 1, "should have at least one audit entry");
    const last = entries[entries.length - 1];
    assert.equal(last.flagName, "audit-flag");
    assert.equal(typeof last.timestampMs, "number");
  });

  test("audit entry contains contextSnapshot, matchedRuleId, value", async () => {
    const { evaluate, auditLog } = await import("./index.ts");
    const flag = { name: "audit-shape", defaultValue: "default", rules: [] };
    evaluate(flag, { bucketKey: "ctx-user", attributes: { x: 1 } });
    const entries = auditLog();
    const entry = entries.find((e: { flagName: string }) => e.flagName === "audit-shape");
    assert.ok(entry, "entry for audit-shape should exist");
    assert.ok("contextSnapshot" in entry);
    assert.ok("matchedRuleId" in entry);
    assert.ok("value" in entry);
    assert.ok("timestampMs" in entry);
  });

  test("auditLog(limit) returns at most `limit` latest entries", async () => {
    const { evaluate, auditLog } = await import("./index.ts");
    const flag = { name: "limit-flag", defaultValue: 0, rules: [] };
    for (let i = 0; i < 5; i++) {
      evaluate(flag, { bucketKey: `user-${i}` });
    }
    const limited = auditLog(2);
    assert.ok(limited.length <= 2);
  });

  test("audit ring buffer caps at 1000 entries", async () => {
    const { evaluate, auditLog } = await import("./index.ts");
    const flag = { name: "ring-flag", defaultValue: 0, rules: [] };
    // Overflow the buffer
    for (let i = 0; i < 1100; i++) {
      evaluate(flag, { bucketKey: `bulk-${i}` });
    }
    const all = auditLog();
    assert.ok(all.length <= 1000, `buffer must cap at 1000, got ${all.length}`);
  });
});

// ---------------------------------------------------------------------------
// AC 7 — serialize / parseRegistry round-trip
// ---------------------------------------------------------------------------
describe("AC7: serialize / parseRegistry", () => {
  test("serialize returns a valid JSON string", async () => {
    const { FlagRegistry, serialize } = await import("./index.ts");
    const registry = new FlagRegistry();
    registry.register({ name: "s-flag", defaultValue: true, rules: [] });
    const json = serialize(registry);
    assert.equal(typeof json, "string");
    assert.doesNotThrow(() => JSON.parse(json));
  });

  test("parseRegistry round-trips a registry", async () => {
    const { FlagRegistry, serialize, parseRegistry } = await import("./index.ts");
    const registry = new FlagRegistry();
    registry.register({ name: "rt-flag", defaultValue: 99, rules: [] });
    const json = serialize(registry);
    const restored = parseRegistry(json);
    const flag = restored.get("rt-flag");
    assert.ok(flag, "flag should survive round-trip");
    assert.equal(flag.defaultValue, 99);
  });

  test("parseRegistry throws a ParseError for malformed JSON", async () => {
    const { parseRegistry, ParseError } = await import("./index.ts");
    assert.throws(
      () => parseRegistry("not valid json {{{"),
      (err: unknown) => err instanceof ParseError
    );
  });
});

// ---------------------------------------------------------------------------
// AC 8 — Typed errors exported from the library
// ---------------------------------------------------------------------------
describe("AC8: Typed errors", () => {
  test("RegistryError is exported and is an Error subclass", async () => {
    const { RegistryError } = await import("./index.ts");
    const e = new RegistryError("test");
    assert.ok(e instanceof Error);
    assert.equal(e.name, "RegistryError");
  });

  test("InvalidFlagError is exported and is an Error subclass", async () => {
    const { InvalidFlagError } = await import("./index.ts");
    const e = new InvalidFlagError("test");
    assert.ok(e instanceof Error);
    assert.equal(e.name, "InvalidFlagError");
  });

  test("EvaluationError is exported and is an Error subclass", async () => {
    const { EvaluationError } = await import("./index.ts");
    const e = new EvaluationError("test");
    assert.ok(e instanceof Error);
    assert.equal(e.name, "EvaluationError");
  });

  test("ParseError is exported and is an Error subclass", async () => {
    const { ParseError } = await import("./index.ts");
    const e = new ParseError("test");
    assert.ok(e instanceof Error);
    assert.equal(e.name, "ParseError");
  });
});

// ---------------------------------------------------------------------------
// AC 9 — Public barrel re-exports all documented symbols
// ---------------------------------------------------------------------------
describe("AC9: index.ts barrel exports", () => {
  test("all documented public symbols are exported from index.ts", async () => {
    const mod = await import("./index.ts");
    const expected = [
      "FlagRegistry",
      "evaluate",
      "defineSegment",
      "getSegment",
      "auditLog",
      "serialize",
      "parseRegistry",
      "RegistryError",
      "InvalidFlagError",
      "EvaluationError",
      "ParseError",
    ];
    for (const name of expected) {
      assert.ok(
        name in mod && mod[name as keyof typeof mod] !== undefined,
        `index.ts must export "${name}"`
      );
    }
  });
});
