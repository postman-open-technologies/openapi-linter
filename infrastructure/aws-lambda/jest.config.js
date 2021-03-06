// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require("../../jest.common");

module.exports = {
  projects: [
    {
      ...common,
      rootDir: "../..",
      displayName: { name: "@spec-linter-api/aws-lambda", color: "cyan" },
      testMatch: ["<rootDir>/infrastructure/aws-lambda/__tests__/**/*.test.ts"],
    },
  ],
};
