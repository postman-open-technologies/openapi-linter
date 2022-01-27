import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { create as createAPI } from "./spec-linter-api";

export class SpecLinterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const stageName = this.node.tryGetContext("stagename") || "dev";
    const apiID: string | undefined = this.node.tryGetContext("apiid");

    createAPI(this, stageName, apiID);
  }
}
