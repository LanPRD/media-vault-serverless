import type { ListFilesOutput } from "@/application/dtos/list-files.dto";

export class ListFilesPresenter {
  static toHTTP(useCaseResult: ListFilesOutput) {
    return {
      files: useCaseResult.files.map(media => ({
        id: media.id.toString(),
        fileName: media.fileName.value,
        fileSize: media.fileSize.value,
        contentType: media.contentType.value,
        ownerId: media.ownerId.toString(),
        s3Key: media.s3Key.value,
        thumbnail: media.thumbnail,
        status: media.status.value,
        createdAt: media.createdAt.toISOString(),
        updatedAt: media.updatedAt.toISOString()
      })),
      nextCursor: useCaseResult.nextCursor
    };
  }
}
