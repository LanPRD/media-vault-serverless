import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import {
  ErrorResponseSchema,
  GenerateUploadUrlRequestSchema,
  GenerateUploadUrlResponseSchema
} from "../../dtos";

export function registerUploadsPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/uploads/presign",
    summary: "Generate presigned upload URL",
    description:
      "Generates a presigned S3 URL for uploading media files. The URL expires after a configured time period.",
    tags: ["Uploads"],
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: GenerateUploadUrlRequestSchema
          }
        }
      }
    },
    responses: {
      201: {
        description: "Upload URL generated successfully",
        content: {
          "application/json": {
            schema: GenerateUploadUrlResponseSchema
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
}
