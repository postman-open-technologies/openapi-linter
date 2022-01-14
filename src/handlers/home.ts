import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildProblemResponse, buildProblemType } from "../problems";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "GET") {
    return buildProblemResponse(405, {
      type: buildProblemType("unsupported-method"),
      title: "Unsupported method",
      detail: "This operation only supports the following method: GET",
    });
  }

  return {
    statusCode: 200,
    headers: {
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
