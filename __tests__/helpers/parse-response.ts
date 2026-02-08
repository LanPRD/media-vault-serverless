import type { APIGatewayProxyResultV2 } from "aws-lambda";
import type { ZodIssue } from "zod";

export interface ErrorResponse {
  error: string;
  issues?: ZodIssue[];
}

export function expectSuccess<T>(result: APIGatewayProxyResultV2): T {
  if (typeof result !== "object" || !("statusCode" in result)) {
    throw new Error("Invalid response format");
  }

  const statusCode = result.statusCode ?? 200;

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`Expected success but got ${statusCode}: ${result.body}`);
  }

  return JSON.parse(result.body ?? "null");
}

export function expectError(
  result: APIGatewayProxyResultV2,
  expectedStatus?: number
): ErrorResponse {
  if (typeof result !== "object" || !("statusCode" in result)) {
    throw new Error("Invalid response format");
  }

  const statusCode = result.statusCode ?? 200;

  if (statusCode >= 200 && statusCode < 300) {
    throw new Error(`Expected error but got success: ${result.body}`);
  }

  if (expectedStatus && statusCode !== expectedStatus) {
    throw new Error(`Expected status ${expectedStatus} but got ${statusCode}`);
  }

  return JSON.parse(result.body ?? "null");
}

export function getStatusCode(result: APIGatewayProxyResultV2): number {
  if (typeof result !== "object" || !("statusCode" in result)) {
    throw new Error("Invalid response format");
  }

  return result.statusCode ?? 200;
}
