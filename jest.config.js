const common = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["<rootDir>/.aws-sam"],
  moduleNameMapper: {
    "^@stoplight/spectral-ruleset-bundler/(.*)":
      "<rootDir>/node_modules/@stoplight/spectral-ruleset-bundler/dist/$1",
    "^nimma/fallbacks$":
      "<rootDir>/node_modules/nimma/dist/cjs/fallbacks/index.js",
    "^nimma/legacy$": "<rootDir>/node_modules/nimma/dist/legacy/cjs/index.js",
  },
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: { name: "@spec-linter-api/core", color: "greenBright" },
      testMatch: ["<rootDir>/core/__tests__/**/*.test.ts"],
    },
  ],
};
