import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const ListFilesRequestHeaderSchema = z.object({
  Authorization: z.string().openapi({ example: "Bearer 1234567890" })
});

export const ListFilesRequestQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().openapi({
    example: 20,
    description: "Page size limit",
    format: "int32"
  }),
  lastMediaId: z.uuid().optional().openapi({
    description: "ID of the last media item from the previous page",
    example: "123e4567-e89b-12d3-a456-426655440000"
  }),
  lastCreatedAt: z.string().datetime().optional().openapi({
    description:
      "Creation timestamp of the last media item from the previous page",
    example: "2026-02-11T12:00:00.000Z"
  })
});

export type ListFilesRequestQueryDto = z.infer<
  typeof ListFilesRequestQuerySchema
>;

// Response
export const PaginationCursorSchema = z.object({
  mediaId: z.uuid().openapi({
    description: "ID of the last media item",
    example: "123e4567-e89b-12d3-a456-426655440000"
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp of the last media item",
    example: "2026-02-11T12:00:00.000Z"
  })
});

export const ListFilesResponseSchema = z.object({
  files: z.array(z.any()),
  nextCursor: PaginationCursorSchema.nullable().openapi({
    description: "Cursor data to use for fetching the next page"
  })
});

export type ListFilesResponseDto = z.infer<typeof ListFilesResponseSchema>;
