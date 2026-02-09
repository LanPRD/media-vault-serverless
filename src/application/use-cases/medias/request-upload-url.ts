import { left, right, type Either } from "@/core/either";
import { UniqueEntityId } from "@/core/entities";
import { AppError, InternalError } from "@/core/errors";
import { Media } from "@/domain/entities";
import type { MediaRepository } from "@/domain/repositories/media-repository";
import type { StorageService } from "@/domain/services/storage.service";
import { ContentType, FileName, FileSize, S3Key } from "@/domain/value-objects";

interface RequestUploadUrlInput {
  ownerId: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

interface RequestUploadUrlOutput {
  uploadUrl: string;
  fileId: string;
  expiresIn: number;
}

type UseCaseResult = Either<AppError, RequestUploadUrlOutput>;

export class RequestUploadUrlUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageGateway: StorageService
  ) {}

  async execute(input: RequestUploadUrlInput): Promise<UseCaseResult> {
    try {
      const fileName = FileName.create(input.fileName);
      const fileSize = FileSize.create(input.fileSize);
      const contentType = ContentType.create(input.contentType);

      const ownerId = new UniqueEntityId(input.ownerId);
      const mediaId = new UniqueEntityId();

      const s3Key = S3Key.create(
        ownerId.toString(),
        mediaId.toString(),
        fileName.extension()
      );

      const media = Media.create(
        {
          ownerId,
          fileName,
          fileSize,
          contentType,
          s3Key
        },
        mediaId
      );

      const uploadResult = await this.storageGateway.generateUploadUrl({
        key: s3Key,
        contentType
      });

      await this.mediaRepository.save(media);

      return right({
        uploadUrl: uploadResult.url,
        fileId: mediaId.toString(),
        expiresIn: uploadResult.expiresIn
      });
    } catch (error) {
      if (error instanceof AppError) {
        return left(error);
      }

      return left(
        new InternalError(error instanceof Error ? error.message : undefined)
      );
    }
  }
}
