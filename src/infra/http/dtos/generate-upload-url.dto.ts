import { EnumContentType } from "@/domain/enums";
import { z } from "zod";

export const generateUploadUrlBodySchema = z.object({
  fileName: z.string({ error: "fileName is required" }),
  fileSize: z.number({ error: "fileSize is required" }).positive(),
  contentType: z.enum(EnumContentType, {
    error: `contentType must be one of: ${Object.values(EnumContentType).join(", ")}`
  })
});

export interface GenerateUploadUrlResponseDto {
  uploadUrl: string;
  fileId: string;
  expiresIn: number;
}
