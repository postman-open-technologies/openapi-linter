import { Context, HttpRequest } from "@azure/functions";
import { handlers } from "@spec-linter-api/core";
import { adapter as requestAdapter } from "../request-adapter";
import { adapter as responseAdapter } from "../response-adapter";

export async function handler(
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.res = responseAdapter(await handlers.home(requestAdapter(req)));
}
