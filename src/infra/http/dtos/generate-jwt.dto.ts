import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

// Response
export const GenerateJwtResponseSchema = z.object({
  token: z.string().openapi({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT token for authentication"
  })
});

export type GenerateJwtResponseDto = z.infer<typeof GenerateJwtResponseSchema>;
