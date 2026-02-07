import { AppError } from "@/core/errors";

export const DomainErrors = {
  INVALID_FILE_NAME: (message: string) =>
    new AppError("INVALID_FILE_NAME", message),

  INVALID_FILE_SIZE: (message: string) =>
    new AppError("INVALID_FILE_SIZE", message),

  INVALID_CONTENT_TYPE: (message: string) =>
    new AppError("INVALID_CONTENT_TYPE", message),

  INVALID_STATUS_TRANSITION: (from: string, to: string) =>
    new AppError(
      "INVALID_STATUS_TRANSITION",
      `Cannot transition from ${from} to ${to}`
    ),

  THUMBNAIL_NOT_ALLOWED: () =>
    new AppError("THUMBNAIL_NOT_ALLOWED", "Only images can have thumbnails")
} as const;
