import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: "VALIDATION_ERROR",
    description: "Error code"
  }),
  message: z.string().openapi({
    example: "Invalid request body",
    description: "Human-readable error message"
  })
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;
