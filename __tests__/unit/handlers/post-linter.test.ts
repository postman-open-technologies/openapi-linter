import { linter } from "../../../src/handlers/post-linter";
import {
  DEFAULT_PROXY_EVENT,
  fetchProblem,
  fetchProblemFixture,
  fetchSuccess,
} from "../../utils/helpers";
import ruleset from "../../__fixtures__/ruleset.json";
import fetch, { Response } from "node-fetch";
import { problems } from "../../../src/problems";

jest.mock("node-fetch");

describe("post linter", () => {
  it("should return successful results", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(JSON.stringify(ruleset)),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchSuccess("post-linter");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await linter(ev);
    mockFetch.mockRestore();

    expect(mockedResponse.text).toBeCalled();
    expect(result.statusCode).toEqual(200);
  });

  it("should return a problem on an unsupported method", async () => {
    const payload = await fetchProblem("post-linter-unsupported-method");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await linter(ev);

    expect(result).toEqual(problems.UNSUPPORTED_METHOD);
  });

  it("should return a problem on an unsupported request body", async () => {
    const payload = await fetchProblem("post-linter-unsupported-request-body");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await linter(ev);

    expect(result).toEqual(problems.UNSUPPORTED_REQUEST_BODY);
  });

  it("should return a problem on an invalid request body syntax", async () => {
    const payload = await fetchProblem(
      "post-linter-invalid-request-body-syntax"
    );
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation(() => {});
    const result = await linter(ev);
    consoleError.mockRestore;

    expect(consoleError).toBeCalled();
    expect(result).toEqual(problems.INVALID_REQUEST_BODY_SYNTAX);
  });

  it("should return a problem on a linter execution error", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest
        .fn()
        .mockResolvedValue(
          fetchProblemFixture("post-linter-linter-execution-error.txt")
        ),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchProblem("post-linter-linter-execution-error");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation(() => {});
    const result = await linter(ev);
    consoleError.mockRestore;
    mockFetch.mockRestore();

    //expect(consoleError).toBeCalled();
    expect(result).toEqual(problems.LINTER_EXECUTION_ERROR);
  });
});
