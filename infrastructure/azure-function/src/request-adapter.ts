import { HttpRequest } from "@azure/functions";
import { Request } from "@spec-linter-api/core";
import { URL } from "url";

export const adapter = (req: HttpRequest): Request => {
  for (const key of Object.keys(req.headers)) {
    req[key.toLowerCase()] = req.headers[key];
  }

  const requestURL = new URL(req.url);

  return {
    method: req.method,
    url: requestURL,
    headers: req.headers,
    body: req.rawBody,
  };
};
