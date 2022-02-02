import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { linter, home, $default } from "./handlers";
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
