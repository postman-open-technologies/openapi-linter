export type LinterError =
  | SpecSyntaxError
  | TypeScriptCompilationError
  | InvalidRulesetError
  | LinterExecutionError;

export class SpecSyntaxError extends Error {
  constructor(err: Error) {
    const message = `Could not parse request body: ${err.message}`;
    super(message);
    this.stack = err.stack;
    this.name = "SpecSyntaxError";
  }
}

export class TypeScriptCompilationError extends Error {
  constructor(err: Error) {
    const message = `TypeScript compilation error: ${err.message}`;
    super(message);
    this.stack = err.stack;
    this.name = "TypeScriptCompilationError";
  }
}

export class InvalidRulesetError extends Error {
  constructor(err: Error) {
    super(err.message);
    this.stack = err.stack;
    this.name = "InvalidRulesetError";
  }
}

export class LinterExecutionError extends Error {
  constructor(err: Error) {
    const message = `Failed to retrieve lint results: ${err.message}`;
    super(message);
    this.stack = err.stack;
    this.name = "LinterExecutionError";
  }
}
