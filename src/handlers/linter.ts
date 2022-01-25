import "source-map-support/register";

import fs from "fs/promises";
import { URL, URLSearchParams } from "url";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventHeaders,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
} from "aws-lambda";
import contentTypeParser from "content-type-parser";
import yaml from "js-yaml";
import busboy, { FileInfo } from "busboy";
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
import { Readable } from "stream";

class InvalidRequestError extends Error {
  constructor(err: Error) {
    super(err.message);
  }
}

class TypeScriptCompilationError extends Error {
  constructor(err: Error) {
    super(err.message);
  }
}

type Definition = {
  source: string;
  value: object;
};

type File = {
  name: string;
  info: FileInfo;
  value: object;
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return problems.UNSUPPORTED_METHOD;
  }

  for (const key of Object.keys(event.headers)) {
    event.headers[key.toLowerCase()] = event.headers[key];
  }

  const t = contentTypeParser(event.headers["content-type"]);

  const isValidContent = [
    "application/json",
    "text/yaml",
    "multipart/form-data",
  ].includes(`${t?.type}/${t?.subtype}`);

  if (!event.body || !isValidContent) {
    return problems.UNSUPPORTED_REQUEST_BODY;
  }

  try {
    const rulesetIdentifier = await prepareRuleset(event.queryStringParameters);
    const definitions = await getDefinitions(t, event.headers, event.body);

    const [ruleset, results] = await lint(definitions, {
      format: OutputFormat.JSON,
      encoding: "utf-8",
      ignoreUnknownFormat: false,
      failOnUnmatchedGlobs: true,
      ruleset: rulesetIdentifier,
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
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(allResults),
    };
  } catch (err) {
    if (err instanceof InvalidRequestError) {
      console.error(`Could not parse request body: ${err.message}`);
      return problems.INVALID_REQUEST_BODY_SYNTAX;
    }
    if (err instanceof TypeScriptCompilationError) {
      const message = `TypeScript compilation error: ${err.message}`;
      console.error(message);
      return problems.TYPESCRIPT_COMPILATION_FAILURE;
    }

    const message = `Failed to retrieve lint results: ${err.message}`;
    console.error(message);
    if (err.message === "Invalid ruleset provided") {
      return problems.INVALID_RULESET_PROVIDED;
    }
    return problems.LINTER_EXECUTION_ERROR;
  }
};

const lint = async function (
  definitions: Definition[],
  flags: ILintConfig
): Promise<[Ruleset, IRuleResult[]]> {
  const spectral = new Spectral();
  const ruleset = await getRuleset(flags.ruleset);
  spectral.setRuleset(ruleset);

  const results: IRuleResult[] = [];

  for (const definition of definitions) {
    const document = new Document(
      JSON.stringify(definition.value),
      Parsers.Yaml,
      definition.source
    );
    results.push(
      ...(await spectral.run(document, {
        ignoreUnknownFormat: flags.ignoreUnknownFormat,
      }))
    );
  }

  return [spectral.ruleset, results];
};

const parseForm = async function (
  headers: APIGatewayProxyEventHeaders,
  body: string
): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers });
    const results: File[] = [];
    bb.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => {
        chunks.push(chunk.toString("utf8"));
      });

      file.on("close", () => {
        results.push({ name, info, value: yaml.load(chunks.join()) as object });
      });

      file.on("error", (err) => {
        reject(err);
      });
    });
    bb.on("error", (err) => {
      reject(err);
    });
    bb.on("close", () => {
      resolve(results);
    });
    Readable.from(body).pipe(bb);
  });
};

const getDefinitions = async (
  t: { type: string; subtype: string },
  headers: APIGatewayProxyEventHeaders,
  body: string
): Promise<Definition[]> => {
  try {
    if (t.type === "multipart" && t.subtype === "form-data") {
      const results = await parseForm(headers, body);
      // TODO: Actually check content-types.
      return results
        .filter((file) => file.name === "definition")
        .map((file) => {
          return {
            source: file.info.filename,
            value: file.value,
          };
        });
    } else {
      return [{ source: "<BODY>", value: yaml.load(body) as object }];
    }
  } catch (err) {
    throw new InvalidRequestError(err);
  }
};

const prepareRuleset = async (
  queryStringParameters?: APIGatewayProxyEventQueryStringParameters
): Promise<string> => {
  let rulesUrl =
    queryStringParameters?.rulesUrl ||
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
      throw new TypeScriptCompilationError(err);
    }
  }
  return rulesUrl;
};
