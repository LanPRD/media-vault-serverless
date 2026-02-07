import { left, right, type Either } from "@/core/either";
import { UniqueEntityId } from "@/core/entities";
import { Media } from "@/domain/entities";
import type { StorageGateway } from "@/domain/gateways/storage-gateway";
import type { MediaRepository } from "@/domain/repositories/media-repository";
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

export type RequestUploadUrlError =
  | { type: "INVALID_FILE_NAME"; message: string }
  | { type: "INVALID_FILE_SIZE"; message: string }
  | { type: "INVALID_CONTENT_TYPE"; message: string }
  | { type: "STORAGE_ERROR"; message: string };

type UseCaseResult = Either<RequestUploadUrlError, RequestUploadUrlOutput>;

export class RequestUploadUrlUseCase {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageGateway: StorageGateway
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

      await this.mediaRepository.save(media);

      const uploadResult = await this.storageGateway.generateUploadUrl({
        key: s3Key,
        contentType,
        expiresIn: 300
      });

      return right({
        uploadUrl: uploadResult.url,
        fileId: mediaId.toString(),
        expiresIn: uploadResult.expiresIn
      });
    } catch (error) {
      return left(this.mapError(error));
    }
  }

  private mapError(error: unknown): RequestUploadUrlError {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.toLowerCase().includes("file name")) {
      return { type: "INVALID_FILE_NAME", message };
    }

    if (message.toLowerCase().includes("file size")) {
      return { type: "INVALID_FILE_SIZE", message };
    }

    if (message.toLowerCase().includes("content type")) {
      return { type: "INVALID_CONTENT_TYPE", message };
    }

    return { type: "STORAGE_ERROR", message };
  }
}
