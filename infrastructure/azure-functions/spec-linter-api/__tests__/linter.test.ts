import router from "../router";
import { fetchProblem, fetchRuleset, fetchValid } from "./__utils__/helpers";
import fetch, { Response } from "@spec-linter-api/core/node_modules/node-fetch";
import { buildProblemResponse, problems } from "@spec-linter-api/core";
import { Context } from "@azure/functions";
import { adapter as responseAdapter } from "../response-adapter";

jest.mock("@spec-linter-api/core/node_modules/node-fetch");

function adaptedProblemResponse(problem) {
  return responseAdapter(buildProblemResponse(problem));
}

describe("post linter", () => {
  it("should return successful results with a single definition", async () => {
    const context = { res: {} } as Context;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(fetchRuleset("success.json")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const request = await fetchValid("linter-single");
    await router(context, request);
    mockFetch.mockRestore();

    expect(context.res.status).toEqual(200);
    expect(mockedResponse.text).toBeCalled();
  });

  it("should return successful results with multiple definitions", async () => {
    const context = { res: {} } as Context;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(fetchRuleset("success.json")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const request = await fetchValid("linter-multi");
    await router(context, request);
    mockFetch.mockRestore();

    expect(context.res.status).toEqual(200);
    expect(mockedResponse.text).toBeCalled();
  });

  it("should return a problem on an unsupported method", async () => {
    const context = { res: {} } as Context;
    const request = await fetchProblem("linter-unsupported-method");
    await router(context, request);

    expect(context.res).toEqual(
      adaptedProblemResponse(problems.UNSUPPORTED_METHOD)
    );
  });

  it("should return a problem on an unsupported request body", async () => {
    const context = { res: {} } as Context;
    const request = await fetchProblem("linter-unsupported-request-body");
    await router(context, request);

    expect(context.res).toEqual(
      adaptedProblemResponse(problems.UNSUPPORTED_REQUEST_BODY)
    );
  });

  it("should return a problem on an invalid request body syntax", async () => {
    const context = { res: {} } as Context;
    const request = await fetchProblem("linter-invalid-request-body-syntax");

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    await router(context, request);
    consoleError.mockRestore;

    expect(consoleError).toBeCalled();
    expect(context.res).toEqual(
      adaptedProblemResponse(problems.INVALID_REQUEST_BODY_SYNTAX)
    );
  });

  it("should return a problem on an invalid ruleset", async () => {
    const context = { res: {} } as Context;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest.fn().mockResolvedValue(Promise.resolve("")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const request = await fetchProblem("linter-invalid-ruleset-provided");

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    await router(context, request);
    consoleError.mockRestore;
    mockFetch.mockRestore();

    expect(consoleError).toBeCalled();
    expect(context.res).toEqual(
      adaptedProblemResponse(problems.INVALID_RULESET_PROVIDED)
    );
  });

  it("should return a problem on a linter execution error", async () => {
    const context = { res: {} } as Context;
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    const mockedResponse = {
      text: jest
        .fn()
        .mockResolvedValue(fetchRuleset("linter-linter-execution-error.txt")),
    } as jest.MockedFunction<any>;
    mockFetch.mockResolvedValue(mockedResponse as Response);

    const request = await fetchProblem("linter-linter-execution-error");

    jest.spyOn(console, "error");
    const consoleError = console.error as jest.MockedFunction<any>;
    consoleError.mockImplementation();
    await router(context, request);
    consoleError.mockRestore;
    mockFetch.mockRestore();

    expect(consoleError).toBeCalled();
    expect(context.res).toEqual(
      adaptedProblemResponse(problems.LINTER_EXECUTION_ERROR)
    );
  });
});
