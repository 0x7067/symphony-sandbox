export interface Context {
  key: string;
  attributes: Record<string, unknown>;
}

export interface PercentageRule<T> {
  kind: "percentage";
  id: string;
  /** 0–100 inclusive. 100 = always match, 0 = never match. */
  percentage: number;
  value: T;
}

export interface AttributeRule<T> {
  kind: "attribute";
  id: string;
  attribute: string;
  expected: unknown;
  value: T;
}

export interface SegmentRule<T> {
  kind: "segment";
  id: string;
  segment: string;
  value: T;
}

export type Rule<T> = PercentageRule<T> | AttributeRule<T> | SegmentRule<T>;

export interface Flag<T> {
  name: string;
  defaultValue: T;
  rules: Rule<T>[];
}
