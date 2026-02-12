import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "@/domain/entities";
import type {
  FindByOwnerIdParams,
  FindByOwnerIdResult,
  MediaRepository
} from "@/domain/repositories/media.repository";

export class FakeMediaRepository implements MediaRepository {
  public medias: Media[] = [];
  public shouldFail = false;

  async save(media: Media): Promise<void> {
    if (this.shouldFail) {
      throw new Error("Database operation failed");
    }

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
    if (this.shouldFail) {
      throw new Error("Database operation failed");
    }

    return (
      this.medias.find(
        media =>
          media.id.toString() === id.toString() &&
          media.ownerId.toString() === userId.toString()
      ) ?? null
    );
  }

  async findByOwnerId(
    props: FindByOwnerIdParams
  ): Promise<FindByOwnerIdResult> {
    if (this.shouldFail) {
      throw new Error("Database operation failed");
    }

    const { ownerId, limit, cursor } = props;

    const pk = this.toPK(ownerId);

    const all = this.medias
      .filter(m => this.toPK(m.ownerId) === pk)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let startIndex = 0;

    if (cursor) {
      const cursorPk =
        typeof cursor.PK === "string" ? cursor.PK : this.toPK(cursor.PK);

      if (cursorPk === pk) {
        const idx = all.findIndex(m => this.toSK(m) === cursor.SK);
        startIndex = idx >= 0 ? idx + 1 : 0;
      }
    }

    const items = all.slice(startIndex, startIndex + (limit ?? 20));

    return {
      items,
      nextCursor:
        items.length > 0 ?
          { PK: pk, SK: this.toSK(items[items.length - 1]) }
        : null
    };
  }
  async findByS3Key(s3Key: string): Promise<Media | null> {
    if (this.shouldFail) {
      throw new Error("Database operation failed");
    }

    return this.medias.find(media => media.s3Key.value === s3Key) ?? null;
  }

  private toPK(ownerId: UniqueEntityId | string) {
    const id = typeof ownerId === "string" ? ownerId : ownerId.toString();
    return `USER#${id}`;
  }

  private toSK(media: Media) {
    return `MEDIA#${media.createdAt.toISOString()}#${media.id.toString()}`;
  }
}
