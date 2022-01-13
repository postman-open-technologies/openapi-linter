import { linter } from "../../../src/handlers/post-linter";
import { DEFAULT_PROXY_EVENT } from "../../utils/helpers";
import event from "../../../events/post-linter.json";
import ruleset from "../../__fixtures__/ruleset.json";
import fetch, { Response } from "node-fetch";

jest.mock("node-fetch");

describe("post linter", function () {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  it("should return lint results", async () => {
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify(ruleset)),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, event);
    const result = await linter(ev);

    expect(result.statusCode).toEqual(200);
  });
});
