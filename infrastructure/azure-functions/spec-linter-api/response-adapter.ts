import { Response } from "@spec-linter-api/core";

export function adapter(res: Response): any {
  const { statusCode, headers, body } = res;
  return {
    status: statusCode,
    headers,
    body,
  };
}
