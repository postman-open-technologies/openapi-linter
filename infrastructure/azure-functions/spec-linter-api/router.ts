import { URL } from "url";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { linter, home, $default } from "./handlers";

const handler: AzureFunction = async (
  context: Context,
  req: HttpRequest
): Promise<void> => {
  const url = new URL(req.url);
  switch (url.pathname) {
    case "/api/linter":
      await linter(context, req);
      break;
    case "/api":
      await home(context, req);
      break;
    default:
      await $default(context);
  }
};

export default handler;
