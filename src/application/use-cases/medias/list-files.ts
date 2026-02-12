import type {
  ListFilesInput,
  ListFilesOutput
} from "@/application/dtos/list-files.dto";
import { left, right, type Either } from "@/core/either";
import { UniqueEntityId } from "@/core/entities";
import { InternalError } from "@/core/errors";
import type { MediaRepository } from "@/domain/repositories/media.repository";

type UseCaseResult = Either<InternalError, ListFilesOutput>;

export class ListFilesUseCase {
  constructor(private mediaRepository: MediaRepository) {}

  async execute({
    userId,
    lastMediaId,
    lastCreatedAt,
    limit = 20
  }: ListFilesInput): Promise<UseCaseResult> {
    let cursor: Record<string, any> | undefined;

    if (lastMediaId && lastCreatedAt) {
      cursor = {
        PK: `USER#${userId}`,
        SK: `MEDIA#${lastCreatedAt}#${lastMediaId}`
      };
    }

    try {
      const result = await this.mediaRepository.findByOwnerId({
        ownerId: new UniqueEntityId(userId),
        limit,
        cursor
      });

      let nextCursor: ListFilesOutput["nextCursor"] = null;

      if (result.nextCursor?.SK) {
        const skParts = result.nextCursor.SK.split("#");

        nextCursor = {
          createdAt: skParts[1],
          mediaId: skParts[2]
        };
      }

      return right({
        files: result.items,
        nextCursor
      });
    } catch (error) {
      return left(
        new InternalError(error instanceof Error ? error.message : undefined)
      );
    }
  }
}
