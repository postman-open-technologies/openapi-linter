import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { linter, home, $default } from "@spec-linter-api/core";
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
