import * as path from "path";
import { Duration, Names, Stack } from "@aws-cdk/core";
import {
  Deployment,
  LambdaIntegration,
  RestApi,
  Stage,
} from "@aws-cdk/aws-apigateway";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export function create(
  stack: Stack,
  apiSuffix: string,
  stageName: string
): { api: RestApi; stage: Stage } {
  const apiName = `spec-linter-api-${apiSuffix}`;
  const api = new RestApi(stack, apiName, { deploy: false });

  const router = new NodejsFunction(
    stack,
    `spec-linter-function-router-${apiSuffix}-${stageName}`,
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
    `spec-linter-deployment-${apiSuffix}-${stageName}`,
    {
      api,
    }
  );

  const stage = new Stage(
    stack,
    `spec-linter-stage-${apiSuffix}-${stageName}`,
    {
      stageName,
      deployment,
    }
  );

  api.deploymentStage = stage;

  return { api, stage };
}
