import type {
  DownloadFileInput,
  DownloadFileOutput
} from "@/application/dtos/download-file.dto";
import { left, right, type Either } from "@/core/either";
import { UniqueEntityId } from "@/core/entities";
import { InternalError, NotFoundError } from "@/core/errors";
import type { MediaRepository } from "@/domain/repositories/media.repository";
import type { StorageService } from "@/domain/services/storage.service";

type UseCaseResult = Either<NotFoundError | InternalError, DownloadFileOutput>;

export class DownloadFileUseCase {
  constructor(
    private mediaRepository: MediaRepository,
    private storageService: StorageService
  ) {}

  async execute(props: DownloadFileInput): Promise<UseCaseResult> {
    const fileId = new UniqueEntityId(props.fileId);
    const ownerId = new UniqueEntityId(props.ownerId);
    const createdAt = new Date(props.createdAt);

    const file = await this.mediaRepository.findByIdAndUserId(
      fileId,
      createdAt,
      ownerId
    );

    if (!file) {
      return left(new NotFoundError("File not found"));
    }

    try {
      const downloadUrl = await this.storageService.generateDownloadUrl(
        file.s3Key
      );

      return right({
        downloadUrl: downloadUrl.url,
        expiresIn: downloadUrl.expiresIn,
        fileName: file.fileName.value
      });
    } catch (error) {
      return left(
        new InternalError(error instanceof Error ? error.message : undefined)
      );
    }
  }
}
