import { Context } from "@azure/functions";
import router from "../router";

describe("router", () => {
  test("unknown paths should return a Not Found response", async () => {
    const request = {
      method: "GET",
      url: "http://api.linting.org/api/teatime",
      headers: {},
    };

    const context = { res: {} } as Context;
    await router(context, request);

    expect(context.res.status).toBe(404);
  });
});
