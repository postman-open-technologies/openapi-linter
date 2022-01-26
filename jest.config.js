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
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: { name: "@spec-linter-api/core", color: "green" },
      testMatch: ["<rootDir>/core/__tests__/**/*.test.ts"],
    },
    {
      ...common,
      displayName: { name: "@spec-linter-api/core", color: "cyan" },
      testMatch: ["<rootDir>/infrastructure/aws-lambda/__tests__/**/*.test.ts"],
    },
  ],
};
