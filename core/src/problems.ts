import { Response } from "./types";

export type Problem = {
  status: number;
  type: string;
  title: string;
  detail: string;
};

export const problems: { [key: string]: Problem } = {
  UNSUPPORTED_METHOD: {
    status: 405,
    type: buildProblemType("unsupported-method"),
    title: "Unsupported method",
    detail: "This operation only supports the following methods: POST, OPTIONS",
  },
  UNSUPPORTED_REQUEST_BODY: {
    status: 415,
    type: buildProblemType("unsupported-request-body"),
    title: "Unsupported request body",
    detail:
      "This operation only supports the following request body media types: application/json, text/yaml",
  },
  INVALID_REQUEST_BODY_SYNTAX: {
    status: 400,
    type: buildProblemType("invalid-request-body-syntax"),
    title: "Invalid request body syntax",
    detail:
      "The request body media type is supported, but its syntax is invalid",
  },
  TYPESCRIPT_COMPILATION_FAILURE: {
    status: 500,
    type: buildProblemType("typescript-compilation-failure"),
    title: "Failed to compile TypeScript ruleset",
    detail:
      "Unable to transpile TypeScript into JavaScript. This is likely an issue with the TypeScript file.",
  },
  INVALID_RULESET_PROVIDED: {
    status: 500,
    type: buildProblemType("invalid-ruleset-provided"),
    title: "Invalid ruleset provided",
    detail: "The ruleset used for this linter execution is invalid.",
  },
  LINTER_EXECUTION_ERROR: {
    status: 500,
    type: buildProblemType("linter-execution-error"),
    title: "Failed to execute linter",
    detail: "Failed to execute linter and retrieve lint results.",
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    type: buildProblemType("internal-server-error"),
    title: "Internal server error.",
    detail: "A server-side error has occurred.",
  },
};

export function buildProblemType(type: string): string {
  const typeRoot = "https://api.linting.org/problems";
  return `${typeRoot}/${type}`;
}

export function buildProblemResponse(problem: Problem): Response {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/problem+json; charset=utf-8",
  };

  return {
    statusCode: problem.status,
    headers,
    body: JSON.stringify(problem),
  };
}
