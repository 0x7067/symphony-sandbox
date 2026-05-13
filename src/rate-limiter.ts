export interface RateLimiterOptions {
  readonly maxTokens: number;
  readonly refillPerMs: number;
}

export class RateLimiter {
  private readonly maxTokens: number;
  private readonly refillPerMs: number;
  private tokens: number;
  private lastUpdate: number;

  constructor(opts: RateLimiterOptions) {
    this.maxTokens = opts.maxTokens;
    this.refillPerMs = opts.refillPerMs;
    this.tokens = opts.maxTokens;
    this.lastUpdate = 0;
  }

  /** Try to consume `n` tokens. Returns true on success. */
  tryConsume(n: number, nowMs: number): boolean {
    const elapsed = nowMs - this.lastUpdate;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillPerMs);
    this.lastUpdate = nowMs;

    if (this.tokens >= n) {
      this.tokens -= n;
      return true;
    }
    return false;
  }
}
