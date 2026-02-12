import { UniqueEntityId } from "@/core/entities";
import { Media, type MediaProps } from "@/domain/entities";
import { EnumContentType } from "@/domain/enums";
import type { MediaRepository } from "@/domain/repositories/media.repository";
import { ContentType, FileName, FileSize, S3Key } from "@/domain/value-objects";
import { faker } from "@faker-js/faker";

export class FakeMedia {
  static build(
    overrides: Partial<MediaProps> = {},
    ownerId?: UniqueEntityId,
    id?: UniqueEntityId
  ): Media {
    const ownerIdCreated = ownerId ?? new UniqueEntityId();
    const idCreated = id ?? new UniqueEntityId();

    const contentType =
      overrides.contentType ??
      ContentType.create(faker.helpers.enumValue(EnumContentType));

    const extension = contentType.extension();

    const fileName = FileName.create(
      `${faker.word.noun()}_${faker.word.adjective()}.${extension}`
    );

    const fileSize = FileSize.create(
      faker.number.int({ min: 1, max: 1024 * 1024 })
    );

    const s3Key = S3Key.create(
      ownerIdCreated?.toString(),
      idCreated.toString(),
      extension
    );

    return Media.create(
      {
        contentType,
        fileName,
        fileSize,
        s3Key,
        ownerId: ownerIdCreated,
        ...overrides
      },
      id ?? idCreated
    );
  }
}

export class DynamoFakeMedia {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async build(
    overrides: Partial<MediaProps> = {},
    ownerId?: UniqueEntityId,
    id?: UniqueEntityId
  ): Promise<Media> {
    const notification = FakeMedia.build(overrides, ownerId, id);

    await this.mediaRepository.save(notification);

    return notification;
  }
}
