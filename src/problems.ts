import { APIGatewayProxyResult } from "aws-lambda";

type ProblemSubset = {
  type: string;
  title: string;
  detail: string;
};

export const problems = {
  UNSUPPORTED_METHOD: buildProblemResponse(405, {
    type: buildProblemType("unsupported-method"),
    title: "Unsupported method",
    detail: "This operation only supports the following method: POST",
  }),
  UNSUPPORTED_REQUEST_BODY: buildProblemResponse(415, {
    type: buildProblemType("unsupported-request-body"),
    title: "Unsupported request body",
    detail:
      "This operation only supports the following request body media types: application/json, text/yaml",
  }),
  INVALID_REQUEST_BODY_SYNTAX: buildProblemResponse(400, {
    type: buildProblemType("invalid-request-body-syntax"),
    title: "Invalid request body syntax",
    detail:
      "The request body media type is supported, but its syntax is invalid",
  }),
  TYPESCRIPT_COMPILATION_FAILURE: buildProblemResponse(500, {
    type: buildProblemType("typescript-compilation-failure"),
    title: "Failed to compile TypeScript ruleset",
    detail:
      "Unable to transpile TypeScript into JavaScript. This is likely an issue with the TypeScript file.",
  }),
  LINTER_EXECUTION_ERROR: buildProblemResponse(500, {
    type: buildProblemType("linter-execution-error"),
    title: "Failed to execute linter",
    detail: "Failed to execute linter and retrieve lint results.",
  }),
};

export function buildProblemType(type: string): string {
  const typeRoot = "https://api.linting.org/problems";
  return `${typeRoot}/${type}`;
}

export function buildProblemResponse(
  status: number,
  problem: ProblemSubset
): APIGatewayProxyResult {
  const headers = {
    "Content-Type": "application/problem+json; charset=utf-8",
  };

  return {
    statusCode: status,
    headers,
    body: JSON.stringify(Object.assign({}, problem, { status })),
  };
}
