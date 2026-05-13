export class RegistryError extends Error {
  override name = "RegistryError";
  constructor(message: string) {
    super(message);
  }
}

export class InvalidFlagError extends Error {
  override name = "InvalidFlagError";
  constructor(message: string) {
    super(message);
  }
}

export class EvaluationError extends Error {
  override name = "EvaluationError";
  constructor(message: string) {
    super(message);
  }
}

export class ParseError extends Error {
  override name = "ParseError";
  constructor(message: string) {
    super(message);
  }
}
