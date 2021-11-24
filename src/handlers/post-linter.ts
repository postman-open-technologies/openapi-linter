import "source-map-support/register";

import { URL } from "url";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import contentTypeParser from "content-type-parser";
import fetch from "node-fetch";
import yaml from "js-yaml";
import { stdin as mockStdin } from "mock-stdin";

import { lint } from "@stoplight/spectral-cli/dist/services/linter";
import { getRuleset } from "@stoplight/spectral-cli/dist/services/linter/utils";
import { OutputFormat } from "@stoplight/spectral-cli/dist/services/config";

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

  const stdin = mockStdin();
  try {
    const openapi = yaml.load(event.body); // works with both JSON and YAML.
    console.log(JSON.stringify(openapi));
    stdin.send(JSON.stringify(openapi));
    stdin.end();
  } catch (err) {
    console.error(`Could not parse request body: ${err.message}`);
    return {
      statusCode: 400,
      body: null,
    };
  }

  let rulesUrl =
    event.queryStringParameters?.rulesUrl ||
    "https://rules.linting.org/testing/base.yaml"; // TODO: Accept from env var.

  let ruleset = null;
  try {
    const rulesetResponse = await fetch(rulesUrl);
    const rulesetText = (await rulesetResponse.text()) || "";
    let inputType = "";

    try {
      JSON.parse(rulesetText);
      inputType = "json";
    } catch (_err) {
      try {
        yaml.load(rulesetText);
        inputType = "yaml";
      } catch (err) {
        const errorMessage = `Rules URL returned an invalid format, requires JSON or YAML, ${rulesUrl}`;
        console.error(errorMessage);
        return {
          statusCode: 400,
          body: errorMessage,
        };
      }
    }

    // Spectral requires URLs to end in .json, .yaml, or .yml.
    const testUrl = new URL(rulesUrl);
    if (inputType === "json" && !rulesUrl.endsWith("json")) {
      rulesUrl += testUrl.search ? "&hack=.json" : "?hack=.json";
    } else if (
      inputType === "yaml" &&
      !rulesUrl.endsWith("yaml") &&
      !rulesUrl.endsWith("yml")
    ) {
      rulesUrl += testUrl.search ? "&hack=.yaml" : "?hack=.yaml";
    }

    ruleset = await getRuleset(rulesUrl);
    //console.log(JSON.stringify(ruleset));
  } catch (err) {
    console.error("cannot load ruleset:", err);
    return;
  }

  try {
    const results = await lint([0], {
      format: OutputFormat.STYLISH,
      encoding: "utf-8",
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
      ruleset: rulesUrl,
      stdinFilepath: "./openapi",
    });

    stdin.restore();

    const failedCodes = results.map((r) => r.code);
    const passedRules = Object.keys(ruleset.rules)
      .filter((c) => !failedCodes.includes(c))
      .map((c) => {
        const rule = ruleset.rules[c];
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
    console.error(
      `Could not load ruleset from ${rulesUrl}, using default. Error: ${err.message}`
    );
  }

  try {
  } catch (err) {
    console.error(`Failed to retrieve lint results: ${err.message}`);
    return { statusCode: 500, body: null };
  }
};
