import { Context } from "@azure/functions";
import router from "../router";

describe("home", () => {
  it("the root path should return a JSON Home document", async () => {
    const request = {
      method: "GET",
      url: "http://api.linting.org/api",
      headers: {},
    };

    const context = { res: {} } as Context;
    await router(context, request);

    expect(context.res.status).toBe(200);
    expect(context.res.headers["Content-Type"]).toBe("application/home+json");

    const body = JSON.parse(context.res.body);

    expect(body).toHaveProperty("api");
    expect(body).toHaveProperty("resources");
  });
});
