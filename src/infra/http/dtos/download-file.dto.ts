import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request

export const DownloadFilePathSchema = z.object({
  fileId: z.uuid().openapi({
    description: "ID of the file to download",
    example: "123e4567-e89b-12d3-a456-426655440000"
  }),
  createdAt: z.iso.datetime().openapi({
    description: "Creation timestamp of the file",
    example: "2026-02-11T12:00:00.000Z"
  })
});

export type DownloadFilePathDto = z.infer<typeof DownloadFilePathSchema>;

// Response
export const DownloadFileResponseSchema = z.object({
  downloadUrl: z.string().openapi({
    description: "URL to download the file",
    example:
      "https://example.com/media/123e4567-e89b-12d3-a456-426655440000.mp4",
    format: "uri"
  }),
  expiresIn: z.number().openapi({
    example: 300,
    description: "URL expiration time in seconds",
    format: "int32"
  }),
  fileName: z.string().openapi({
    example: "video.mp4",
    description: "Name of the file"
  })
});

export type DownloadFileResponseDto = z.infer<
  typeof DownloadFileResponseSchema
>;
