// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require("./jest.common");

module.exports = {
  rootDir: "../../",
  projects: [
    {
      ...common,
      displayName: { name: "@spec-linter-api/azure-functions", color: "blue" },
      testMatch: [
        "<rootDir>/infrastructure/azure-functions/**/__tests__/**/*.test.ts",
      ],
    },
    {
      ...common,
      displayName: { name: "@spec-linter-api/aws-lambda", color: "yellow" },
      testMatch: ["<rootDir>/infrastructure/aws-lambda/__tests__/**/*.test.ts"],
    },
  ],
};
