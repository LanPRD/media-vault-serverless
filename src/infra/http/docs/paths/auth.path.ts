import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { GenerateJwtResponseSchema } from "../../dtos";

export function registerAuthPaths(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: "post",
    path: "/auth",
    summary: "Generate JWT token",
    description:
      "Generates a JWT token for authentication. This endpoint is for development/testing purposes.",
    tags: ["Auth"],
    responses: {
      200: {
        description: "JWT token generated successfully",
        content: {
          "application/json": {
            schema: GenerateJwtResponseSchema
          }
        }
      }
    }
  });
}
