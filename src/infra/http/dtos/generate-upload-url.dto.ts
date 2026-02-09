import { EnumContentType } from "@/domain/enums";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const GenerateUploadUrlRequestSchema = z.object({
  fileName: z
    .string({ error: "fileName is required" })
    .openapi({ example: "photo.jpg" }),
  fileSize: z
    .number({ error: "fileSize is required" })
    .positive()
    .openapi({ example: 1024, description: "File size in bytes" }),
  contentType: z
    .enum(EnumContentType, {
      error: `contentType must be one of: ${Object.values(EnumContentType).join(", ")}`
    })
    .openapi({ example: "image/jpeg" })
});

export type GenerateUploadUrlRequestDto = z.infer<
  typeof GenerateUploadUrlRequestSchema
>;

// Response
export const GenerateUploadUrlResponseSchema = z.object({
  uploadUrl: z.url().openapi({
    example:
      "https://s3.amazonaws.com/media-vault-serverless-bucket-dev/user-123/image.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256..."
  }),
  fileId: z.uuid().openapi({ example: "550e8400-e29b-41d4-a716-446655440000" }),
  expiresIn: z
    .number()
    .openapi({ example: 300, description: "URL expiration time in seconds" })
});

export type GenerateUploadUrlResponseDto = z.infer<
  typeof GenerateUploadUrlResponseSchema
>;
