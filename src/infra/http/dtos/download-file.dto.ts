import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const DownloadFilePathSchema = z.object({
  fileId: z.uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426655440000",
    description: "Unique identifier of the file to download"
  }),
  createdAt: z.iso.datetime().openapi({
    example: "2026-02-11T12:00:00.000Z",
    description: "Creation timestamp of the file (used for efficient lookup)"
  })
});

export type DownloadFilePathDto = z.infer<typeof DownloadFilePathSchema>;

// Response
export const DownloadFileResponseSchema = z.object({
  downloadUrl: z.url().openapi({
    example:
      "https://s3.amazonaws.com/media-vault-bucket/media/user-123/file-456/video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    description: "Presigned S3 URL for downloading the file via GET request"
  }),
  expiresIn: z.number().int().positive().openapi({
    example: 300,
    description: "URL expiration time in seconds",
    format: "int32"
  }),
  fileName: z.string().openapi({
    example: "vacation-video.mp4",
    description: "Original name of the file"
  })
});

export type DownloadFileResponseDto = z.infer<
  typeof DownloadFileResponseSchema
>;
