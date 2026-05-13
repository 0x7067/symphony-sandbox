export interface EvalContext {
  bucketKey: string;
  attributes?: Record<string, unknown>;
}

export interface PercentageRule<T> {
  id: string;
  kind: "percentage";
  percentage: number; // 0–100
  value: T;
}

export interface AttributeRule<T> {
  id: string;
  kind: "attribute";
  attribute: string;
  value: unknown; // the attribute value to match
  returnValue: T;
}

export interface SegmentRule<T> {
  id: string;
  kind: "segment";
  segment: string;
  value: T;
}

export type Rule<T> = PercentageRule<T> | AttributeRule<T> | SegmentRule<T>;

export interface Flag<T> {
  name: string;
  defaultValue: T;
  rules: Rule<T>[];
}
