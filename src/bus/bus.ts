import type { Listener } from "./listener.ts";

export type Unsubscribe = () => void;

export class EventBus<EM extends Record<string, unknown>> {
  private readonly _listeners: Map<keyof EM, Set<Listener<EM, keyof EM>>> =
    new Map();

  lastEmitErrors: unknown[] = [];

  on<K extends keyof EM>(event: K, handler: Listener<EM, K>): Unsubscribe {
    let handlers = this._listeners.get(event);
    if (!handlers) {
      handlers = new Set();
      this._listeners.set(event, handlers);
    }
    handlers.add(handler as Listener<EM, keyof EM>);
    return () => {
      handlers!.delete(handler as Listener<EM, keyof EM>);
    };
  }

  once<K extends keyof EM>(event: K, handler: Listener<EM, K>): Unsubscribe {
    const wrapper: Listener<EM, K> = (payload) => {
      unsub();
      handler(payload);
    };
    const unsub = this.on(event, wrapper);
    return unsub;
  }

  emit<K extends keyof EM>(event: K, payload: EM[K]): void {
    this.lastEmitErrors = [];
    const handlers = this._listeners.get(event);
    if (!handlers) return;
    for (const handler of [...handlers]) {
      try {
        (handler as Listener<EM, K>)(payload);
      } catch (err) {
        this.lastEmitErrors.push(err);
      }
    }
  }

  listenerCount(event: keyof EM): number {
    return this._listeners.get(event)?.size ?? 0;
  }
}
