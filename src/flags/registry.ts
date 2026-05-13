import type { Flag } from "./types.ts";

export class FlagRegistry {
  private readonly flags = new Map<string, Flag<any>>();

  register<T>(flag: Flag<T>): void {
    this.flags.set(flag.name, flag);
  }

  get<T>(name: string): Flag<T> | undefined {
    return this.flags.get(name) as Flag<T> | undefined;
  }

  listAll(): Flag<unknown>[] {
    return [...this.flags.values()];
  }
}
