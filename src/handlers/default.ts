import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 404,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: "",
  };
};
