import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "@/domain/entities";
import type { MediaRepository } from "@/domain/repositories/media.repository";

export class FakeMediaRepository implements MediaRepository {
  public medias: Media[] = [];

  async save(media: Media): Promise<void> {
    const index = this.medias.findIndex(
      m => m.id.toString() === media.id.toString()
    );

    if (index >= 0) {
      this.medias[index] = media;
    } else {
      this.medias.push(media);
    }
  }

  async findByIdAndUserId(
    id: UniqueEntityId,
    userId: UniqueEntityId
  ): Promise<Media | null> {
    return (
      this.medias.find(
        media =>
          media.id.toString() === id.toString() &&
          media.ownerId.toString() === userId.toString()
      ) ?? null
    );
  }

  async findByOwnerId(ownerId: UniqueEntityId): Promise<Media[]> {
    return this.medias.filter(
      media => media.ownerId.toString() === ownerId.toString()
    );
  }

  async findByS3Key(s3Key: string): Promise<Media | null> {
    return this.medias.find(media => media.s3Key.value === s3Key) ?? null;
  }
}
