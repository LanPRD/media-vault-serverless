import type { ProcessUploadInput } from "@/application/dtos";
import { left, right, type Either } from "@/core/either";
import { BadRequestError, InternalError, NotFoundError } from "@/core/errors";
import { EnumMediaStatus } from "@/domain/enums";
import type { MediaRepository } from "@/domain/repositories/media.repository";
import type { ImageProcessingService } from "@/domain/services/image-processing.service";
import type { StorageService } from "@/domain/services/storage.service";
import { MediaStatus } from "@/domain/value-objects";

type UseCaseResult = Either<
  BadRequestError | NotFoundError | InternalError,
  null
>;

export class ProcessUploadUseCase {
  constructor(
    private mediaRepository: MediaRepository,
    private storageService: StorageService,
    private imageProcessingService: ImageProcessingService
  ) {}

  async execute(props: ProcessUploadInput): Promise<UseCaseResult> {
    const { key, fileExtension } = props;

    if (!fileExtension.match(/^(jpeg|png)$/i)) {
      return left(new BadRequestError("Unsupported file extension"));
    }

    const media = await this.mediaRepository.findByS3Key(key);

    if (!media) {
      return left(new NotFoundError("Media not found", key));
    }

    const ownerId = media.ownerId.toString();
    const mediaId = media.id.toString();
    const thumbnailKey = `thumbnails/${ownerId}/${mediaId}.jpg`;

    try {
      const originalFile = await this.storageService.getObject(key);

      const thumbnail =
        await this.imageProcessingService.generateThumbnail(originalFile);

      await this.storageService.putObject({
        key: thumbnailKey,
        body: thumbnail,
        contentType: "image/jpeg"
      });

      media.status = MediaStatus.create(EnumMediaStatus.READY);
      media.thumbnail = thumbnailKey;

      await this.mediaRepository.save(media);
    } catch (error) {
      return left(
        new InternalError(error instanceof Error ? error.message : undefined)
      );
    }

    return right(null);
  }
}
