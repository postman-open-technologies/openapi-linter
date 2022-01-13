import fs from "fs/promises";
import path from "path";
import { APIGatewayProxyEvent } from "aws-lambda";

export const DEFAULT_PROXY_EVENT: APIGatewayProxyEvent = {
  httpMethod: "GET",
  path: "/",
  queryStringParameters: {},
  headers: {},
  body: null,
  multiValueHeaders: {},
  multiValueQueryStringParameters: {},
  isBase64Encoded: false,
  pathParameters: {},
  stageVariables: {},
  requestContext: null,
  resource: null,
};

export async function fetchSuccess(handler: string) {
  const fixture = await fetchSuccessFixture(`${handler}.json`);
  return JSON.parse(fixture);
}

export async function fetchProblem(problem: string) {
  const fixture = await fetchProblemFixture(`${problem}.json`);
  return JSON.parse(fixture);
}

const fixtureRoot = path.join(__dirname, "..", "__fixtures__");
const eventRoot = path.join(fixtureRoot, "events");

export async function fetchSuccessFixture(fileName: string) {
  const data = await fs.readFile(path.join(eventRoot, fileName), "utf8");
  return data;
}

export async function fetchProblemFixture(fileName: string) {
  const data = await fs.readFile(
    path.join(eventRoot, "problems", fileName),
    "utf8"
  );
  return data;
}

export async function fetchRuleset(fileName: string) {
  const data = await fs.readFile(
    path.join(fixtureRoot, "rulesets", fileName),
    "utf8"
  );
  return data;
}
