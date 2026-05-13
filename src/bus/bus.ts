type Unsubscribe = () => void;

export class EventBus<EM extends Record<string, unknown> = Record<string, unknown>> {
  private listeners: Map<keyof EM, Array<(payload: unknown) => void>> = new Map();
  public lastEmitErrors: unknown[] = [];

  on<K extends keyof EM>(event: K, handler: (payload: EM[K]) => void): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler as (payload: unknown) => void);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler as (payload: unknown) => void);
        if (idx !== -1) handlers.splice(idx, 1);
      }
    };
  }

  once<K extends keyof EM>(event: K, handler: (payload: EM[K]) => void): Unsubscribe {
    const unsub = this.on(event, (payload) => {
      unsub();
      handler(payload);
    });
    return unsub;
  }

  emit<K extends keyof EM>(event: K, payload: EM[K]): void {
    this.lastEmitErrors = [];
    const handlers = this.listeners.get(event) ?? [];
    for (const handler of handlers.slice()) {
      try {
        handler(payload);
      } catch (err) {
        this.lastEmitErrors.push(err);
      }
    }
  }

  listenerCount<K extends keyof EM>(event: K): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}
