import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildProblemResponse, buildProblemType } from "@spec-linter-api/core";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return buildProblemResponse(405, {
      type: buildProblemType("unsupported-method"),
      title: "Unsupported method",
      detail:
        "This operation only supports the following methods: GET, OPTIONS",
    });
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/home+json",
    },
    body: JSON.stringify({
      api: {
        title: "API Spec Linter",
      },
      resources: {
        "tag:linting.org,2022:linter": {
          hrefTemplate: "/linter{?rulesUrl}",
          hrefVars: {
            rulesUrl: "tag:linting.org,2022:linter/url#rulesUrl",
          },
          hints: {
            allow: ["POST"],
            formats: {
              "application/json": {},
            },
            acceptPost: ["application/json", "text/yaml"],
          },
        },
      },
    }),
  };
};
