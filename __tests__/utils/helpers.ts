import { APIGatewayProxyEvent } from "aws-lambda";

export const DEFAULT_PROXY_EVENT: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  queryStringParameters: {},
  headers: {},
  body: null,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  isBase64Encoded: false,
  pathParameters: {},
  stageVariables: {},
  requestContext: null,
  resource: null,
};
