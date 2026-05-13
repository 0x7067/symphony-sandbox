import { FlagRegistry } from "./registry.ts";
import { ParseError } from "./errors.ts";
import type { Flag } from "./types.ts";

export function serialize(registry: FlagRegistry): string {
  return JSON.stringify(registry.list());
}

export function parseRegistry(json: string): FlagRegistry {
  let flags: unknown;
  try {
    flags = JSON.parse(json);
  } catch (err) {
    throw new ParseError(`Invalid JSON: ${(err as Error).message}`);
  }
  if (!Array.isArray(flags)) {
    throw new ParseError("Expected a JSON array of flags");
  }
  const registry = new FlagRegistry();
  for (const flag of flags) {
    registry.register(flag as Flag<unknown>);
  }
  return registry;
}
