import type { Flag } from "./types.ts";

export class FlagRegistry {
  private readonly flags = new Map<string, Flag<unknown>>();

  register<T>(flag: Flag<T>): void {
    this.flags.set(flag.name, flag as Flag<unknown>);
  }

  get<T = unknown>(name: string): Flag<T> | undefined {
    return this.flags.get(name) as Flag<T> | undefined;
  }

  list<T = unknown>(): Flag<T>[] {
    return Array.from(this.flags.values()) as Flag<T>[];
  }
}
