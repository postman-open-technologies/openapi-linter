import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { create as createAPI } from "./spec-linter-api";

export class SpecLinterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stackSuffix = this.node.tryGetContext("stackSuffix") || "main";
    const apiSuffix = this.node.tryGetContext("apiSuffix") || stackSuffix;
    const stageName =
      this.node.tryGetContext("stageName") ||
      (stackSuffix === "main" ? "prod" : "dev");

    createAPI(this, apiSuffix, stageName);
  }
}
