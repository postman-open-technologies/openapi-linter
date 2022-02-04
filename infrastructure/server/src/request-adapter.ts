import querystring, { ParsedUrlQueryInput } from "querystring";
import { IncomingMessage, Server } from "http";
import { URL } from "url";
import { FastifyRequest } from "fastify";
import { RouteGenericInterface } from "fastify/types/route";
import { Request } from "@spec-linter-api/core";

export function adapter(
  request: FastifyRequest<RouteGenericInterface, Server, IncomingMessage>
): Request {
  const requestURL = new URL(
    `https://${request.headers.host}${request.url}?${querystring.stringify(
      request.query as ParsedUrlQueryInput
    )}`
  );

  return {
    url: requestURL,
    method: request.method,
    headers: request.headers as { [key: string]: string },
    body: request.body as string,
  };
}
