export class EventBus<EM extends Record<string, unknown> = Record<string, unknown>> {
  private listeners: Map<keyof EM, Array<(payload: unknown) => void>> = new Map();
  public lastEmitErrors: unknown[] = [];

  on<K extends keyof EM>(event: K, handler: (payload: EM[K]) => void): () => void {
    const h = handler as (payload: unknown) => void;
    let bucket = this.listeners.get(event);
    if (!bucket) this.listeners.set(event, bucket = []);
    bucket.push(h);
    return () => {
      const idx = bucket!.indexOf(h);
      if (idx !== -1) bucket!.splice(idx, 1);
    };
  }

  once<K extends keyof EM>(event: K, handler: (payload: EM[K]) => void): () => void {
    const unsub = this.on(event, (payload) => { unsub(); handler(payload); });
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
