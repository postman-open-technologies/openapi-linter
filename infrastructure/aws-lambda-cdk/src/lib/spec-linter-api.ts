import * as path from "path";
import { Duration, Stack } from "@aws-cdk/core";
import {
  Deployment,
  LambdaIntegration,
  RestApi,
  Stage,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { LogLevel, NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export const create = (stack: Stack, stageName: string, apiID?: string) => {
  const api = apiID
    ? RestApi.fromRestApiId(stack, `spec-linter-${stageName}-api`, apiID)
    : new RestApi(stack, `spec-linter-${stageName}-api`, {});

  const router = new NodejsFunction(
    stack,
    `spec-linter-${stageName}-router-function`,
    {
      memorySize: 1024,
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_14_X,
      entry: path.resolve(__dirname, "../resources/router.ts"),
      bundling: {
        minify: true,

        // this is because of jsonc-parser
        // https://github.com/evanw/esbuild/issues/1619#issuecomment-922787629
        mainFields: ["module", "main"],

        tsconfig: path.resolve(__dirname, "..", "..", "tsconfig.build.json"),
        externalModules: ["aws-sdk"],
      },
    }
  );

  const integration = new LambdaIntegration(router);

  api.root.addMethod("ANY", integration);
  api.root.addResource("linter").addMethod("ANY", integration);
  api.root.addProxy({ anyMethod: true, defaultIntegration: integration });

  const deployment = new Deployment(
    stack,
    `spec-linter-${stageName}-deployment`,
    {
      api,
    }
  );

  const stage = new Stage(stack, `spec-linter-${stageName}-stage`, {
    stageName,
    deployment,
  });

  return { api, stage };
};
