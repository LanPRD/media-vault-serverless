import { EnumContentType } from "@/domain/enums";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const GenerateUploadUrlRequestSchema = z.object({
  fileName: z.string({ error: "fileName is required" }).openapi({
    example: "photo.jpg",
    description: "Original name of the file to be uploaded"
  }),
  fileSize: z.number({ error: "fileSize is required" }).positive().openapi({
    example: 1048576,
    description: "File size in bytes (max 100MB)",
    format: "int64"
  }),
  contentType: z
    .enum(EnumContentType, {
      error: `contentType must be one of: ${Object.values(EnumContentType).join(", ")}`
    })
    .openapi({
      example: "image/jpeg",
      description: "MIME type of the file (image/jpeg, image/png, video/mp4)"
    })
});

export type GenerateUploadUrlRequestDto = z.infer<
  typeof GenerateUploadUrlRequestSchema
>;

// Response
export const GenerateUploadUrlResponseSchema = z.object({
  uploadUrl: z.url().openapi({
    example:
      "https://s3.amazonaws.com/media-vault-bucket/media/user-123/file-456/photo.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    description: "Presigned S3 URL for uploading the file via PUT request"
  }),
  fileId: z.uuid().openapi({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Unique identifier assigned to the file"
  }),
  expiresIn: z.number().int().positive().openapi({
    example: 300,
    description: "URL expiration time in seconds",
    format: "int32"
  })
});

export type GenerateUploadUrlResponseDto = z.infer<
  typeof GenerateUploadUrlResponseSchema
>;
