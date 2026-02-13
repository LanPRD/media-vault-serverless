import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const ListFilesRequestQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional().openapi({
    example: 20,
    description:
      "Maximum number of files to return per page (default: 20, max: 100)",
    format: "int32"
  }),
  lastMediaId: z.uuid().optional().openapi({
    example: "123e4567-e89b-12d3-a456-426655440000",
    description:
      "ID of the last media item from the previous page (for pagination)"
  }),
  lastCreatedAt: z.iso.datetime().optional().openapi({
    example: "2026-02-11T12:00:00.000Z",
    description:
      "Creation timestamp of the last media item from the previous page (required with lastMediaId)"
  })
});

export type ListFilesRequestQueryDto = z.infer<
  typeof ListFilesRequestQuerySchema
>;

// Response
export const MediaFileSchema = z.object({
  id: z.uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426655440000",
    description: "Unique identifier of the file"
  }),
  fileName: z.string().openapi({
    example: "vacation-photo.jpg",
    description: "Original name of the uploaded file"
  }),
  fileSize: z.number().int().positive().openapi({
    example: 1048576,
    description: "File size in bytes",
    format: "int64"
  }),
  contentType: z.string().openapi({
    example: "image/jpeg",
    description: "MIME type of the file"
  }),
  ownerId: z.uuid().openapi({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "ID of the user who owns the file"
  }),
  s3Key: z.string().openapi({
    example:
      "media/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426655440000/vacation-photo.jpg",
    description: "S3 object key where the file is stored"
  }),
  thumbnail: z.string().optional().openapi({
    example:
      "thumbnails/550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426655440000/vacation-photo.jpg",
    description:
      "S3 key for the thumbnail image (undefined if not yet processed or not applicable)"
  }),
  status: z.enum(["uploading", "processing", "ready", "failed"]).openapi({
    example: "ready",
    description: "Current processing status of the file"
  }),
  createdAt: z.iso.datetime().openapi({
    example: "2026-02-11T12:00:00.000Z",
    description: "Timestamp when the file was created"
  }),
  updatedAt: z.iso.datetime().openapi({
    example: "2026-02-11T12:05:00.000Z",
    description: "Timestamp when the file was last updated"
  })
});

export type MediaFileDto = z.infer<typeof MediaFileSchema>;

export const PaginationCursorSchema = z.object({
  mediaId: z.uuid().openapi({
    example: "123e4567-e89b-12d3-a456-426655440000",
    description: "ID of the last media item in the current page"
  }),
  createdAt: z.iso.datetime().openapi({
    example: "2026-02-11T12:00:00.000Z",
    description: "Creation timestamp of the last media item in the current page"
  })
});

export type PaginationCursorDto = z.infer<typeof PaginationCursorSchema>;

export const ListFilesResponseSchema = z.object({
  files: z.array(MediaFileSchema).openapi({
    description: "Array of media files owned by the authenticated user"
  }),
  nextCursor: PaginationCursorSchema.nullable().openapi({
    description: "Pagination cursor for the next page (null if no more pages)"
  })
});

export type ListFilesResponseDto = z.infer<typeof ListFilesResponseSchema>;
