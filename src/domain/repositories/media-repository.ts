import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "../entities";

export interface MediaRepository {
  save(media: Media): Promise<void>;
  findById(id: UniqueEntityId): Promise<Media | null>;
}
