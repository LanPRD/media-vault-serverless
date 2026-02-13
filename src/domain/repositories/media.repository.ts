import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "../entities";

export type FindByOwnerIdParams = {
  ownerId: UniqueEntityId;
  limit?: number;
  cursor?: Record<string, any>;
};

export type FindByOwnerIdResult = {
  items: Media[];
  nextCursor: Record<string, any> | null;
};

export interface MediaRepository {
  save(media: Media): Promise<void>;
  findByIdAndUserId(
    id: UniqueEntityId,
    createdAt: Date,
    userId: UniqueEntityId
  ): Promise<Media | null>;
  findByOwnerId(props: FindByOwnerIdParams): Promise<FindByOwnerIdResult>;
  findByS3Key(s3Key: string): Promise<Media | null>;
}
