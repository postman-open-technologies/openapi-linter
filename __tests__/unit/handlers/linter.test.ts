import { handler } from "../../../src/handlers/linter";
import {
  DEFAULT_PROXY_EVENT,
  fetchProblem,
  fetchRuleset,
  fetchValid,
} from "../../utils/helpers";
import fetch, { Response } from "node-fetch";
import { problems } from "../../../src/problems";

jest.mock("node-fetch");

describe("post linter", () => {
  it("should return successful results with a single definition", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(fetchRuleset("success.json")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchValid("linter-single");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await handler(ev);
    mockFetch.mockRestore();

    expect(mockedResponse.text).toBeCalled();
    expect(result.statusCode).toEqual(200);
  });

  it("should return successful results with multiple definitions", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(fetchRuleset("success.json")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchValid("linter-multi");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await handler(ev);
    mockFetch.mockRestore();

    expect(mockedResponse.text).toBeCalled();
    expect(result.statusCode).toEqual(200);
  });

  it("should return a problem on an unsupported method", async () => {
    const payload = await fetchProblem("linter-unsupported-method");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await handler(ev);

    expect(result).toEqual(problems.UNSUPPORTED_METHOD);
  });

  it("should return a problem on an unsupported request body", async () => {
    const payload = await fetchProblem("linter-unsupported-request-body");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);
    const result = await handler(ev);

    expect(result).toEqual(problems.UNSUPPORTED_REQUEST_BODY);
  });

  it("should return a problem on an invalid request body syntax", async () => {
    const payload = await fetchProblem("linter-invalid-request-body-syntax");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    const result = await handler(ev);
    consoleError.mockRestore;

    expect(consoleError).toBeCalled();
    expect(result).toEqual(problems.INVALID_REQUEST_BODY_SYNTAX);
  });

  it("should return a problem on an invalid ruleset", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(Promise.resolve("")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchProblem("linter-invalid-ruleset-provided");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    const result = await handler(ev);
    consoleError.mockRestore;
    mockFetch.mockRestore();

    expect(consoleError).toBeCalled();
    expect(result).toEqual(problems.INVALID_RULESET_PROVIDED);
  });

  it("should return a problem on a linter execution error", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest
        .fn()
        .mockResolvedValue(fetchRuleset("linter-linter-execution-error.txt")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const payload = await fetchProblem("linter-linter-execution-error");
    const ev = Object.assign({}, DEFAULT_PROXY_EVENT, payload);

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    const result = await handler(ev);
    consoleError.mockRestore;
    mockFetch.mockRestore();

    expect(consoleError).toBeCalled();
    expect(result).toEqual(problems.LINTER_EXECUTION_ERROR);
  });
});
