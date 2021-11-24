"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linter = void 0;
require("source-map-support/register");
const promises_1 = require("fs/promises");
const require_from_string_1 = __importDefault(require("require-from-string"));
const spectral_ruleset_migrator_1 = require("@stoplight/spectral-ruleset-migrator");
const spectral_core_1 = require("@stoplight/spectral-core");
const spectral_functions_1 = require("@stoplight/spectral-functions");
const DEFAULT_RULESET = {
    rules: {
        "no-empty-description": {
            given: "$..description",
            message: "Description must not be empty",
            then: {
                function: spectral_functions_1.truthy,
            },
        },
    },
};
const linter = async (event) => {
    var _a;
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: null };
    }
    if (!event.body) {
        return { statusCode: 400, body: null };
    }
    let ruleset = DEFAULT_RULESET;
    let openapi = {};
    try {
        // TODO: Support YAML.
        openapi = JSON.parse(event.body);
    }
    catch (err) {
        console.error(`Could not parse request body: ${err.message}`);
        return {
            statusCode: 400,
            body: null,
        };
    }
    const rulesUrl = ((_a = event.queryStringParameters) === null || _a === void 0 ? void 0 : _a.rulesUrl) ||
        "https://rules.linting.org/testing/base.yaml"; // TODO: Accept from env var.
    try {
        const rulesetModule = await (0, spectral_ruleset_migrator_1.migrateRuleset)(rulesUrl, {
            format: "commonjs",
            fs: { promises: { readFile: promises_1.readFile } }, // unused
        });
        ruleset = (0, require_from_string_1.default)(rulesetModule);
    }
    catch (err) {
        console.error(`Could not load ruleset from ${rulesUrl}, using default. Error: ${err.message}`);
    }
    try {
        const spectral = new spectral_core_1.Spectral();
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
    }
    catch (err) {
        console.error(`Failed to retrieve lint results: ${err.message}`);
        return { statusCode: 500, body: null };
    }
};
exports.linter = linter;
//# sourceMappingURL=post-linter.js.map