export class RegistryError extends Error {
  override name = "RegistryError";
}

export class InvalidFlagError extends Error {
  override name = "InvalidFlagError";
}

export class EvaluationError extends Error {
  override name = "EvaluationError";
}

export class ParseError extends Error {
  override name = "ParseError";
}
