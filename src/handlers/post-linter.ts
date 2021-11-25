import "source-map-support/register";

import { URL } from "url";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import contentTypeParser from "content-type-parser";
import fetch from "node-fetch";
import yaml from "js-yaml";

import { OutputFormat } from "@stoplight/spectral-cli/dist/services/config";
import {
  Document,
  IRuleResult,
  Ruleset,
  Spectral,
} from "@stoplight/spectral-core";
import * as Parsers from "@stoplight/spectral-parsers";
import { getRuleset } from "@stoplight/spectral-cli/dist/services/linter/utils";
import { ILintConfig } from "@stoplight/spectral-cli/dist/services/config";

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

  let rulesUrl =
    event.queryStringParameters?.rulesUrl ||
    "https://rules.linting.org/testing/base.yaml"; // TODO: Accept from env var.

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

    const ruleset = await getRuleset(rulesUrl);
  } catch (err) {
    console.error("cannot load ruleset:", err);
    return;
  }

  try {
    const [ruleset, results] = await lint(JSON.stringify(openapi), {
      format: OutputFormat.STYLISH,
      encoding: "utf-8",
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
      ruleset: rulesUrl,
      stdinFilepath: "./openapi",
    });

    const failedCodes = results.map((r) => String(r.code));
    const failures = results.reduce((prev, f) => {
      const id = f.code;
      prev[id] = prev[id] || [];
      prev[id].push(f);
      return prev;
    }, {});

    const allResults = [];
    for (const code of Object.keys(ruleset.rules)) {
      const status = failedCodes.includes(code) ? "failed" : "passed";

      const { description: message } = ruleset.rules[code];
      let res = {
        code,
        status,
        message,
      };

      if (status == "passed") {
        allResults.push(res);
        continue;
      }

      for (const f of failures[code]) {
        const { message, path, severity, source, range } = f;
        res = Object.assign({}, res, {
          failure: {
            message,
            path,
            severity,
            source,
            range,
          },
        });
        allResults.push(res);
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(allResults),
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

const lint = async function (
  source: string,
  flags: ILintConfig
): Promise<[Ruleset, IRuleResult[]]> {
  const spectral = new Spectral();
  const ruleset = await getRuleset(flags.ruleset);
  spectral.setRuleset(ruleset);

  const document = new Document(source, Parsers.Yaml, flags.ruleset);

  const results: IRuleResult[] = await spectral.run(document, {
    ignoreUnknownFormat: flags.ignoreUnknownFormat,
  });

  return [spectral.ruleset, results];
};
