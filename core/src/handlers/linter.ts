import contentTypeParser from "content-type-parser";

import * as errors from "../services/errors";
import { linter } from "../services/linter";
import { buildProblemResponse, problems } from "../problems";
import { Request, Response } from "../messages";

export const handler = async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (request.method !== "POST") {
    return buildProblemResponse(problems.UNSUPPORTED_METHOD);
  }

  for (const key of Object.keys(request.headers)) {
    request.headers[key.toLowerCase()] = request.headers[key];
  }

  const t = contentTypeParser(request.headers["content-type"]);

  const isValidContent = ["application/json", "text/yaml"].includes(
    `${t?.type}/${t?.subtype}`
  );

  if (!request.body || !isValidContent) {
    return buildProblemResponse(problems.UNSUPPORTED_REQUEST_BODY);
  }

  try {
    const results = await linter(
      request.body,
      request.url.searchParams.get("rulesUrl")
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error(err.message);

    if (err instanceof errors.SpecSyntaxError) {
      return buildProblemResponse(problems.INVALID_REQUEST_BODY_SYNTAX);
    }

    if (err instanceof errors.TypeScriptCompilationError) {
      return buildProblemResponse(problems.TYPESCRIPT_COMPILATION_FAILURE);
    }

    if (err instanceof errors.InvalidRulesetError) {
      return buildProblemResponse(problems.INVALID_RULESET_PROVIDED);
    }

    if (err instanceof errors.LinterExecutionError) {
      return buildProblemResponse(problems.LINTER_EXECUTION_ERROR);
    }

    return buildProblemResponse(problems.INTERNAL_SERVER_ERROR);
  }
};
