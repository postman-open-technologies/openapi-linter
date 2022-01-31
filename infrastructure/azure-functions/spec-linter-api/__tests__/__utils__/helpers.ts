import fs from "fs/promises";
import path from "path";

export async function fetchValid(scenario: string) {
  const fixture = await fetchValidFixture(`${scenario}.json`);
  return JSON.parse(fixture);
}

export async function fetchProblem(scenario: string) {
  const fixture = await fetchProblemFixture(`${scenario}.json`);
  return JSON.parse(fixture);
}

const fixtureRoot = path.join(__dirname, "..", "__fixtures__");
const eventRoot = path.join(fixtureRoot, "events");

export async function fetchValidFixture(fileName: string) {
  const data = await fs.readFile(
    path.join(eventRoot, "valid", fileName),
    "utf8"
  );
  return data;
}

export async function fetchProblemFixture(fileName: string) {
  const data = await fs.readFile(
    path.join(eventRoot, "problem", fileName),
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
