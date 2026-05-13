import { FlagRegistry } from "./registry.ts";
import { ParseError } from "./errors.ts";

export function serialize(registry: FlagRegistry): string {
  return JSON.stringify({ flags: registry.listAll() });
}

export function parseRegistry(json: string): FlagRegistry {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new ParseError(`Malformed JSON: ${json}`);
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ParseError(
      "Registry JSON must be a non-null, non-array object",
    );
  }

  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.flags)) {
    throw new ParseError(
      "Registry JSON must contain a 'flags' array",
    );
  }

  const registry = new FlagRegistry();
  for (const flag of obj.flags) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registry.register(flag as any);
  }
  return registry;
}
