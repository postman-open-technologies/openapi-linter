import { Context } from "@azure/functions";

export async function handler(context: Context): Promise<void> {
  context.res = {
    status: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: "",
  };
}
