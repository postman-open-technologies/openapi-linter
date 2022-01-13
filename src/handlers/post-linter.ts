import "source-map-support/register";

import fs from "fs/promises";
import { URL, URLSearchParams } from "url";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import contentTypeParser from "content-type-parser";
import yaml from "js-yaml";
import ts from "typescript";

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
import { fetch } from "@stoplight/spectral-runtime";

export const linter = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
      },
      body: JSON.stringify({
        type: "https://linting.org/api-errors/unsupported-method",
        title: "Unsupported request body",
        status: 405,
        detail: "This operation only supports the following method: POST",
      }),
    };
  }

  for (const key of Object.keys(event.headers)) {
    event.headers[key.toLowerCase()] = event.headers[key];
  }

  const t = contentTypeParser(event.headers["content-type"]);

  const isValidContent = ["application/json", "text/yaml"].includes(
    `${t?.type}/${t?.subtype}`
  );

  if (!event.body || !isValidContent) {
    return {
      statusCode: 415,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
      },
      body: JSON.stringify({
        type: "https://linting.org/api-errors/unsupported-request-body",
        title: "Unsupported request body",
        status: 415,
        detail:
          "This operation only supports the following request body media types: application/json, text/yaml",
      }),
    };
  }

  try {
    yaml.load(event.body); // works with both JSON and YAML.
  } catch (err) {
    console.error(`Could not parse request body: ${err.message}`);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
      },
      body: JSON.stringify({
        type: "https://linting.org/api-errors/invalid-request-body-syntax",
        title: "Invalid request body syntax",
        status: 400,
        detail:
          "The request body media type is supported, but its syntax is invalid",
      }),
    };
  }

  let rulesUrl =
    event.queryStringParameters?.rulesUrl ||
    "https://rules.linting.org/testing/base.yaml"; // TODO: Accept from env var.

  // Spectral requires URLs to end in .json, .yaml, or .yml.
  const supportedFileExtensions = [
    ".json",
    ".yaml",
    ".yml",
    ".js",
    ".mjs",
    "cjs",
    ".ts",
  ];
  if (!supportedFileExtensions.find((ext) => rulesUrl.endsWith(ext))) {
    // Should work for both JSON and YAML.
    // If it's actually JavaScript or TypeScript, ope.
    const testUrl = new URL(rulesUrl);
    const spectralHack = "$spectral-hack$";

    const params = new URLSearchParams(testUrl.search);
    params.append(spectralHack, ".yaml");

    testUrl.search = params.toString();
    rulesUrl = testUrl.toString();
  }

  if (rulesUrl.endsWith(".ts")) {
    // compile to js in /temp and change rulesUrl
    try {
      const response = await fetch(rulesUrl);
      const contents = await response.text();
      const js = ts.transpileModule(contents, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
        },
      });

      if (js.diagnostics) {
        console.log(js.diagnostics);
      }

      await fs.writeFile("/tmp/.spectral.js", js.outputText);
      rulesUrl = "/tmp/.spectral.js";
    } catch (err) {
      const message = [
        `Unable to transpile TypeScript into JavaScript from ${rulesUrl}.`,
        "This is likely an issue with the TypeScript file.",
      ].join(" ");
      console.error(message);
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/problem+json; charset=utf-8",
        },
        body: JSON.stringify({
          type: "https://linting.org/api-errors/typescript-compilation-failure",
          title: "Failed to compile TypeScript ruleset",
          status: 500,
          detail: message,
        }),
      };
    }
  }

  try {
    const [ruleset, results] = await lint(event.body, {
      format: OutputFormat.JSON,
      encoding: "utf-8",
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
      ruleset: rulesUrl,
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
    const message = `Failed to retrieve lint results: ${err.message}`;
    console.error(message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/problem+json; charset=utf-8",
      },
      body: JSON.stringify({
        type: "https://linting.org/api-errors/linter-execution-error",
        title: "Failed to execute linter",
        status: 500,
        detail: "Failed to execute linter and retrieve lint results.",
      }),
    };
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
