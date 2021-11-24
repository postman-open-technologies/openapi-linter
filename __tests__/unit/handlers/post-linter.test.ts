import { linter } from "../../../src/handlers/post-linter";
import { DEFAULT_PROXY_EVENT } from "../../utils/helpers";
import event from "../../../events/post-linter.json";

describe("post linter", function () {
  it("should return lint results", async () => {
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, event);
    const result = await linter(ev);

    expect(result.statusCode).toEqual(200);
  });
});
