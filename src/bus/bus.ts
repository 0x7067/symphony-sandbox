import type { Listener } from "./listener.ts";

export type Unsubscribe = () => void;

export class EventBus<EM extends Record<string, unknown>> {
  private listeners: Map<keyof EM, Set<Listener<EM, any>>> = new Map();
  public lastEmitErrors: unknown[] = [];

  on<K extends keyof EM>(event: K, handler: Listener<EM, K>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as Listener<EM, any>);
    return () => {
      this.listeners.get(event)?.delete(handler as Listener<EM, any>);
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
    const handlers = this.listeners.get(event);
    if (!handlers) return;
    for (const handler of [...handlers]) {
      try {
        handler(payload);
      } catch (err) {
        this.lastEmitErrors.push(err);
      }
    }
  }

  listenerCount<K extends keyof EM>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}
