import { handler as router } from "../../src/resources/router";
import { DEFAULT_PROXY_EVENT } from "../__utils__/helpers";

describe("router", () => {
  test("unknown paths should return a Not Found response", async () => {
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, {
      method: "GET",
      path: "/teatime",
    });

    const result = await router(ev);

    expect(result.statusCode).toBe(404);
  });
});
