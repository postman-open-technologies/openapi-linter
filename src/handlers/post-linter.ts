import "source-map-support/register";

import { readFile } from "fs/promises";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import contentTypeParser from "content-type-parser";
import yaml from "js-yaml";
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

  const t = contentTypeParser(event.headers["Content-Type"]);

  const isValidContent = ["application/json", "text/yaml"].includes(
    `${t?.type}/${t?.subtype}`
  );

  if (!event.body || !isValidContent) {
    return { statusCode: 400, body: null };
  }

  let ruleset = DEFAULT_RULESET;
  let openapi = {};

  try {
    openapi = yaml.load(event.body); // works with both JSON and YAML.
  } catch (err) {
    console.error(`Could not parse request body: ${err.message}`);
    return {
      statusCode: 400,
      body: null,
    };
  }

  const rulesUrl =
    event.queryStringParameters?.rulesUrl ||
    "https://rules.linting.org/testing/base.yaml"; // TODO: Accept from env var.

  try {
    const rulesetModule = await migrateRuleset(rulesUrl, {
      format: "commonjs",
      fs: { promises: { readFile } }, // unused
    });

    ruleset = requireFromString(rulesetModule);
  } catch (err) {
    console.error(
      `Could not load ruleset from ${rulesUrl}, using default. Error: ${err.message}`
    );
  }

  try {
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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ pass: passedRules, fail: results }),
    };
  } catch (err) {
    console.error(`Failed to retrieve lint results: ${err.message}`);
    return { statusCode: 500, body: null };
  }
};
