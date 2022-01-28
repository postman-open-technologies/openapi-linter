// eslint-disable-next-line @typescript-eslint/no-var-requires
const common = require("./jest.common");

module.exports = {
  rootDir: "../../",
  projects: [
    // {
    //   ...common,
    //   displayName: { name: "@spec-linter-api/core", color: "green" },
    //   testMatch: ["<rootDir>/core/__tests__/**/*.test.ts"],
    // },
    {
      ...common,
      displayName: { name: "@spec-linter-api/aws-lambda", color: "cyan" },
      testMatch: ["<rootDir>/infrastructure/aws-lambda/__tests__/**/*.test.ts"],
    },
  ],
};
