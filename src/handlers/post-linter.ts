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

import { problems } from "../problems";

export const linter = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod !== "POST") {
    return problems.UNSUPPORTED_METHOD;
  }

  for (const key of Object.keys(event.headers)) {
    event.headers[key.toLowerCase()] = event.headers[key];
  }

  const t = contentTypeParser(event.headers["content-type"]);

  const isValidContent = ["application/json", "text/yaml"].includes(
    `${t?.type}/${t?.subtype}`
  );

  if (!event.body || !isValidContent) {
    return problems.UNSUPPORTED_REQUEST_BODY;
  }

  try {
    yaml.load(event.body); // works with both JSON and YAML.
  } catch (err) {
    console.error(`Could not parse request body: ${err.message}`);
    return problems.INVALID_REQUEST_BODY_SYNTAX;
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

      if (js.diagnostics?.length) {
        console.log(js.diagnostics);
      }

      await fs.writeFile("/tmp/.spectral.js", js.outputText);
      rulesUrl = "/tmp/.spectral.js";
    } catch (err) {
      const message = `TypeScript compilation error: ${err.message}`;
      console.error(message);
      return problems.TYPESCRIPT_COMPILATION_FAILURE;
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
    return problems.LINTER_EXECUTION_ERROR;
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
