import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handlers } from "@spec-linter-api/core";
import { URL, URLSearchParams } from "url";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  for (const key of Object.keys(event.headers)) {
    event[key.toLowerCase()] = event.headers[key];
  }

  const params = new URLSearchParams(
    Object.assign(
      {},
      event.multiValueQueryStringParameters || {},
      event.queryStringParameters || {}
    )
  );

  const requestURL = new URL(
    `https://${event.headers.host}${event.path}?${params.toString()}`
  );

  return await handlers.home({
    method: event.httpMethod,
    url: requestURL,
    headers: event.headers,
    body: event.body,
  });
};
