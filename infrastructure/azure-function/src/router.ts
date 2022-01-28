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
      linter(context, req);
      break;
    case "/api":
      home(context, req);
      console.log(context.res);
      break;
    default:
      $default(context);
      console.log(context.res);
  }
};

export default handler;
