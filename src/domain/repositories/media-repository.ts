import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "../entities";

export interface MediaRepository {
  save(media: Media): Promise<void>;
  findByIdAndUserId(
    id: UniqueEntityId,
    userId: UniqueEntityId
  ): Promise<Media | null>;
  findByOwnerId(ownerId: UniqueEntityId): Promise<Media[]>;
  findByS3Key(s3Key: string): Promise<Media | null>;
}
