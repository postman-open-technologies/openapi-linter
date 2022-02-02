import { handler as router } from "../../src/resources/router";
import { DEFAULT_PROXY_EVENT } from "../__utils__/helpers";

describe("home", () => {
  it("the root path should return a JSON Home document", async () => {
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, {
      method: "GET",
      url: "http://api.linting.org/api",
      headers: {},
    });

    const result = await router(ev);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Content-Type"]).toBe("application/home+json");

    const body = JSON.parse(result.body);

    expect(body).toHaveProperty("api");
    expect(body).toHaveProperty("resources");
  });
});
