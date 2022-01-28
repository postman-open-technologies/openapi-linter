import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handlers } from "@spec-linter-api/core";
import { adapter as requestAdapter } from "../request-adapter";

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  return (await handlers.linter(
    requestAdapter(event)
  )) as APIGatewayProxyResult;
}
