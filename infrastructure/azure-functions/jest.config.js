// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require("../../jest.common");

module.exports = {
  projects: [
    {
      ...common,
      rootDir: "../../",
      displayName: { name: "@spec-linter-api/azure-functions", color: "blue" },
      testMatch: [
        "<rootDir>/infrastructure/azure-functions/**/__tests__/**/*.test.ts",
      ],
    },
  ],
};
