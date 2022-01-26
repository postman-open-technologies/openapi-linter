import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler as linter } from "./handlers/linter";
import { handler as home } from "./handlers/home";
import { handler as $default } from "./handlers/default";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  switch (event.path) {
    case "/linter":
      return linter(event);
    case "/":
      return home(event);
    default:
      return $default();
  }
};
