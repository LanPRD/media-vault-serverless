import {
  OpenApiGeneratorV3,
  OpenAPIRegistry
} from "@asteasolutions/zod-to-openapi";
import {
  ErrorResponseSchema,
  GenerateUploadUrlRequestSchema,
  GenerateUploadUrlResponseSchema
} from "../dtos";

export const registry = new OpenAPIRegistry();

// Register schemas
registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("GenerateUploadUrlRequest", GenerateUploadUrlRequestSchema);
registry.register("GenerateUploadUrlResponse", GenerateUploadUrlResponseSchema);

// Security
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT"
});

// Endpoints
registry.registerPath({
  method: "post",
  path: "/uploads/presign",
  summary: "Generate presigned upload URL",
  description: "Generates a presigned S3 URL for uploading media files",
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
      description: "Unauthorized"
    }
  }
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Media Vault API",
      version: "1.0.0",
      description: "API for managing media uploads and storage"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development"
      }
    ]
  });
}
