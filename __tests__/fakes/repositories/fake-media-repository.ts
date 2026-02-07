import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "@/domain/entities";
import type { MediaRepository } from "@/domain/repositories/media-repository";

export class FakeMediaRepository implements MediaRepository {
  public medias: Media[] = [];

  async save(media: Media): Promise<void> {
    this.medias.push(media);
  }

  async findById(id: UniqueEntityId): Promise<Media | null> {
    return (
      this.medias.find(media => media.id.toString() === id.toString()) ?? null
    );
  }
}
