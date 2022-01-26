import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { linter } from "@spec-linter-api/core";
import { home } from "@spec-linter-api/core";
import { $default } from "@spec-linter-api/core";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  switch (event.path) {
    case "/linter":
      return linter.handler(event);
    case "/":
      return home.handler(event);
    default:
      return $default.handler();
  }
};
