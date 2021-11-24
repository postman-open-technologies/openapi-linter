import "source-map-support/register";

import { readFile } from "fs/promises";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import requireFromString from "require-from-string";

import { migrateRuleset } from "@stoplight/spectral-ruleset-migrator";
import { Spectral } from "@stoplight/spectral-core";
import { truthy } from "@stoplight/spectral-functions";

const DEFAULT_RULESET = {
  rules: {
    "no-empty-description": {
      given: "$..description",
      message: "Description must not be empty",
      then: {
        function: truthy,
      },
    },
  },
};

export const linter = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: null };
  }

  const openapi = event.body?.length ? event.body : DEFAULT_RULESET;
  const rulesUrl =
    event.queryStringParameters.rulesUrl ||
    "https://rules.linting.org/testing/base.yaml";

  let ruleset = DEFAULT_RULESET;

  try {
    const rulesetModule = await migrateRuleset(rulesUrl, {
      format: "commonjs",
      fs: { promises: { readFile } }, // unused
    });

    ruleset = requireFromString(rulesetModule);
  } catch (err) {
    console.error(`Could not load ruleset from ${rulesUrl}, using default.`);
  }

  const spectral = new Spectral();
  spectral.setRuleset(ruleset);

  const results = await spectral.run(openapi);
  const failedCodes = results.map((r) => r.code);
  const passedRules = Object.keys(spectral.ruleset.rules)
    .filter((c) => !failedCodes.includes(c))
    .map((c) => {
      const rule = spectral.ruleset.rules[c];
      return {
        code: c,
        message: rule.description,
      };
    });

  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ pass: passedRules, fail: results }),
  };

  return response;
};
