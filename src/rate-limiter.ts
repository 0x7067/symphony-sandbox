export interface RateLimiterOptions {
  readonly maxTokens: number;
  readonly refillPerMs: number;
}

export class RateLimiter {
  constructor(_opts: RateLimiterOptions) {
    // TODO: implement
  }

  /** Try to consume `n` tokens. Returns true on success. */
  tryConsume(_n: number, _nowMs: number): boolean {
    // TODO: implement
    return false;
  }
}
