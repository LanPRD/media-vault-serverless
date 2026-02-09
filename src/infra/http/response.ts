import { AppError, HttpStatus } from "@/core/errors";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

export class HandlerResponse {
  static ok<T>(data: T) {
    return HandlerResponse.json(HttpStatus.OK, data);
  }

  static created<T>(data: T) {
    return HandlerResponse.json(HttpStatus.CREATED, data);
  }

  static noContent() {
    return HandlerResponse.json(HttpStatus.NO_CONTENT, null);
  }

  static error(err: AppError) {
    return HandlerResponse.json(err.statusCode, {
      error: err.errorType,
      message: err.message
    });
  }

  private static json(
    statusCode: number,
    body: unknown
  ): APIGatewayProxyResultV2 {
    return {
      statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    };
  }
}
