import type { APIGatewayProxyResultV2 } from "aws-lambda";
import { AppError, HttpStatus } from "@/core/errors";

const json = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

// Success
export const ok = <T>(data: T) => json(HttpStatus.OK, data);
export const created = <T>(data: T) => json(HttpStatus.CREATED, data);
export const noContent = () => json(HttpStatus.NO_CONTENT, null);

// Error
export const error = (err: AppError) =>
  json(err.statusCode, { error: err.errorType, message: err.message });
