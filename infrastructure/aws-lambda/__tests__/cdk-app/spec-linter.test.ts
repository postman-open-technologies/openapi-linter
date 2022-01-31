import { Template } from "@aws-cdk/assertions";
import { App } from "@aws-cdk/core";
import { SpecLinterStack } from "../../src/lib/spec-linter-stack";

describe("spec-linter-stack", () => {
  it("creates a RestApi resource with a default name", () => {
    const app = new App();
    const stack = new SpecLinterStack(app, "MyTestStack");
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "spec-linter-api-main",
    });
  });

  it("creates a RestApi resource with a custom name", () => {
    const app = new App({ context: { apiSuffix: "dev" } });
    const stack = new SpecLinterStack(app, "MyTestStack-dev");
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
      Name: "spec-linter-api-dev",
    });
  });
});
