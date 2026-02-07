import { AppError } from "@/core/errors";
import type { APIGatewayProxyResultV2 } from "aws-lambda";

export class ErrorMap {
  private static readonly ERROR_CODE_TO_HTTP_STATUS: Record<string, number> = {
    // Domain errors - 400 Bad Request
    INVALID_FILE_NAME: 400,
    INVALID_FILE_SIZE: 400,
    INVALID_CONTENT_TYPE: 400,
    INVALID_STATUS_TRANSITION: 400,
    THUMBNAIL_NOT_ALLOWED: 400,

    // Application errors - 4xx
    MEDIA_NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,

    // Application errors - 5xx
    STORAGE_ERROR: 502,
    UPLOAD_FAILED: 502,
    INTERNAL_ERROR: 500
  };

  static mapUnknownErrorToHttpResponse(
    error: unknown
  ): APIGatewayProxyResultV2 {
    if (error instanceof AppError) {
      return this.mapErrorToHttpResponse(error);
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "INTERNAL_ERROR",
        message
      })
    };
  }

  private static mapErrorToHttpResponse(
    error: AppError
  ): APIGatewayProxyResultV2 {
    const statusCode =
      this.ERROR_CODE_TO_HTTP_STATUS[error.code] ??
      this.ERROR_CODE_TO_HTTP_STATUS.INTERNAL_ERROR;

    return {
      statusCode,
      body: JSON.stringify({
        error: error.code,
        message: error.message
      })
    };
  }
}
