import {
  OpenApiGeneratorV3,
  OpenAPIRegistry
} from "@asteasolutions/zod-to-openapi";
import {
  DownloadFilePathSchema,
  DownloadFileResponseSchema,
  ErrorResponseSchema,
  GenerateJwtResponseSchema,
  GenerateUploadUrlRequestSchema,
  GenerateUploadUrlResponseSchema,
  ListFilesRequestQuerySchema,
  ListFilesResponseSchema,
  MediaFileSchema,
  PaginationCursorSchema
} from "../dtos";
import { registerAuthPaths } from "./paths/auth.path";
import { registerFilesPaths } from "./paths/files.path";
import { registerUploadsPaths } from "./paths/uploads.path";

export const registry = new OpenAPIRegistry();

// Register schemas
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("PaginationCursor", PaginationCursorSchema);
registry.register("GenerateJwtResponse", GenerateJwtResponseSchema);
registry.register("GenerateUploadUrlRequest", GenerateUploadUrlRequestSchema);
registry.register("GenerateUploadUrlResponse", GenerateUploadUrlResponseSchema);
registry.register("ListFilesQuery", ListFilesRequestQuerySchema);
registry.register("MediaFile", MediaFileSchema);
registry.register("ListFilesResponse", ListFilesResponseSchema);
registry.register("DownloadFileParams", DownloadFilePathSchema);
registry.register("DownloadFileResponse", DownloadFileResponseSchema);

// Register security scheme
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT token obtained from POST /auth"
});

// Register paths
registerAuthPaths(registry);
registerUploadsPaths(registry);
registerFilesPaths(registry);

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Media Vault API",
      version: "1.0.0",
      description:
        "API for managing media uploads and storage. Supports image and video uploads with automatic thumbnail generation."
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development"
      }
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints"
      },
      {
        name: "Uploads",
        description: "File upload operations"
      },
      {
        name: "Files",
        description: "File management operations"
      }
    ]
  });
}
