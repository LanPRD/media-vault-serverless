import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  DownloadFilePathSchema,
  DownloadFileResponseSchema,
  ErrorResponseSchema,
  ListFilesRequestQuerySchema,
  ListFilesResponseSchema
} from "../../dtos";

export function registerFilesPaths(registry: OpenAPIRegistry) {
  // List Files
  registry.registerPath({
    method: "get",
    path: "/files",
    summary: "List user files",
    description:
      "Returns a paginated list of media files owned by the authenticated user. Use cursor-based pagination for navigating through results.",
    tags: ["Files"],
    security: [{ bearerAuth: [] }],
    request: {
      query: ListFilesRequestQuerySchema
    },
    responses: {
      200: {
        description: "Files retrieved successfully",
        content: {
          "application/json": {
            schema: ListFilesResponseSchema
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: "Unauthorized - Invalid or missing JWT token"
      }
    }
  });

  // Download File
  registry.registerPath({
    method: "get",
    path: "/files/{createdAt}/{fileId}/download",
    summary: "Get file download URL",
    description:
      "Generates a presigned URL for downloading a specific file. The URL expires after a configured time period.",
    tags: ["Files"],
    security: [{ bearerAuth: [] }],
    request: {
      params: DownloadFilePathSchema
    },
    responses: {
      200: {
        description: "Download URL generated successfully",
        content: {
          "application/json": {
            schema: DownloadFileResponseSchema
          }
        }
      },
      400: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: ErrorResponseSchema
          }
        }
      },
      401: {
        description: "Unauthorized - Invalid or missing JWT token"
      },
      403: {
        description: "Forbidden - User does not own this file",
        content: {
          "application/json": {
            schema: ErrorResponseSchema
          }
        }
      },
      404: {
        description: "File not found",
        content: {
          "application/json": {
            schema: ErrorResponseSchema
          }
        }
      }
    }
  });
}
