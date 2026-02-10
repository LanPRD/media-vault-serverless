import { UniqueEntityId } from "@/core/entities";
import { Media, type MediaProps } from "@/domain/entities";
import { EnumContentType } from "@/domain/enums";
import { ContentType, FileName, FileSize, S3Key } from "@/domain/value-objects";
import { faker } from "@faker-js/faker";

export class FakeMedia {
  static build(
    overrides: Partial<MediaProps> = {},
    ownerId: UniqueEntityId = new UniqueEntityId(),
    id: UniqueEntityId = new UniqueEntityId()
  ): Media {
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

    const s3Key = S3Key.create(ownerId?.toString(), id?.toString(), extension);

    return Media.create(
      {
        contentType,
        fileName,
        fileSize,
        s3Key,
        ...overrides,
        ownerId: ownerId
      },
      id
    );
  }
}
