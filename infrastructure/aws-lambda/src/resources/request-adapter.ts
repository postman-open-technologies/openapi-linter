import { Request } from "@spec-linter-api/core";
import { APIGatewayProxyEvent } from "aws-lambda";
import { URL, URLSearchParams } from "url";

export const adapter = (event: APIGatewayProxyEvent): Request => {
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

  return {
    method: event.httpMethod,
    url: requestURL,
    headers: event.headers,
    body: event.body,
  };
};
