import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Request
export const ProcessUploadRequestSchema = z.object({
  contentType: z
    .string({ error: "contentType is required" })
    .openapi({ example: "image/jpeg" }),
  bucketName: z
    .string({ error: "bucketName is required" })
    .openapi({ example: "media-vault-serverless-bucket-dev" }),
  key: z
    .string({ error: "key is required" })
    .openapi({ example: "user-123/image.jpg" })
});

export type ProcessUploadRequestRequestDto = z.infer<
  typeof ProcessUploadRequestSchema
>;
