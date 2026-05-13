import type { Listener } from "./listener.ts";

export type Unsubscribe = () => void;

export class EventBus<EM extends Record<string, unknown>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly _listeners = new Map<keyof EM, Set<(p: any) => void>>();

  lastEmitErrors: unknown[] = [];

  on<K extends keyof EM>(event: K, handler: Listener<EM, K>): Unsubscribe {
    let handlers = this._listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this._listeners.set(event, handlers);
    }
    handlers.add(handler);
    return () => handlers!.delete(handler);
  }

  once<K extends keyof EM>(event: K, handler: Listener<EM, K>): Unsubscribe {
    const unsub = this.on(event, (payload) => {
      unsub();
      handler(payload);
    });
    return unsub;
  }

  emit<K extends keyof EM>(event: K, payload: EM[K]): void {
    this.lastEmitErrors = [];
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const handler of [...handlers]) {
      try {
        handler(payload);
      } catch (err) {
        this.lastEmitErrors.push(err);
      }
    }
  }

  listenerCount(event: keyof EM): number {
    return this._listeners.get(event)?.size ?? 0;
  }
}
