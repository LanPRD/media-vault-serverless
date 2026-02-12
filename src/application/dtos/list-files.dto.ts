import type { Media } from "@/domain/entities";

export interface ListFilesInput {
  userId: string;
  limit?: number;
  lastMediaId?: string;
  lastCreatedAt?: string;
}

export interface ListFilesOutput {
  files: Media[];
  nextCursor: {
    mediaId: string;
    createdAt: string;
  } | null;
}
