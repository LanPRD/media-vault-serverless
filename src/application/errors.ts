import { AppError } from "@/core/errors";

export const ApplicationErrors = {
  MEDIA_NOT_FOUND: (id: string) =>
    new AppError("MEDIA_NOT_FOUND", `Media with id ${id} not found`),
  UNAUTHORIZED: () => new AppError("UNAUTHORIZED", "Authentication required"),

  FORBIDDEN: () =>
    new AppError(
      "FORBIDDEN",
      "You don't have permission to access this resource"
    ),

  STORAGE_ERROR: (message: string) => new AppError("STORAGE_ERROR", message),

  UPLOAD_FAILED: () =>
    new AppError("UPLOAD_FAILED", "Failed to generate upload URL"),

  INTERNAL_ERROR: (message = "An unexpected error occurred") =>
    new AppError("INTERNAL_ERROR", message)
} as const;
