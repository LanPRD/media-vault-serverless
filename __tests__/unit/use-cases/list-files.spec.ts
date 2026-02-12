import { ListFilesUseCase } from "@/application/use-cases/medias/list-files";
import { UniqueEntityId } from "@/core/entities";
import { FakeMedia } from "__tests__/fakes/entities";
import { FakeMediaRepository } from "__tests__/fakes/repositories/fake-media-repository";

describe("ListFilesUseCase", () => {
  let mediaRepository: FakeMediaRepository;
  let sut: ListFilesUseCase;

  beforeEach(() => {
    mediaRepository = new FakeMediaRepository();
    sut = new ListFilesUseCase(mediaRepository);
  });

  describe("Success scenarios", () => {
    it("should list files for valid user", async () => {
      // Arrange
      const userId = new UniqueEntityId();

      const fakeMedias = [
        FakeMedia.build({ ownerId: userId }),
        FakeMedia.build({ ownerId: userId })
      ];

      mediaRepository.medias = fakeMedias;

      // Act
      const result = await sut.execute({ userId: userId.toString() });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.files).toEqual(fakeMedias);
      }
    });

    it("should list files for valid user with cursor", async () => {
      // Arrange
      const ownerId = new UniqueEntityId();

      const fakeMedias = [
        FakeMedia.build({
          ownerId,
          createdAt: new Date("2026-02-11T10:00:00Z")
        }),
        FakeMedia.build({
          ownerId,
          createdAt: new Date("2026-02-11T09:00:00Z")
        }),
        FakeMedia.build({
          ownerId,
          createdAt: new Date("2026-02-11T08:00:00Z")
        })
      ];

      mediaRepository.medias = fakeMedias;

      // Act - get first page
      const firstPage = await sut.execute({
        userId: ownerId.toString(),
        limit: 1
      });

      expect(firstPage.isRight()).toBe(true);

      if (firstPage.isRight()) {
        expect(firstPage.value.files).toHaveLength(1);
        expect(firstPage.value.files[0].id.toString()).toBe(
          fakeMedias[0].id.toString()
        );
        expect(firstPage.value.nextCursor).not.toBeNull();

        // Act - get second page using cursor
        const secondPage = await sut.execute({
          userId: ownerId.toString(),
          lastMediaId: firstPage.value.nextCursor!.mediaId,
          lastCreatedAt: firstPage.value.nextCursor!.createdAt,
          limit: 1
        });

        expect(secondPage.isRight()).toBe(true);

        if (secondPage.isRight()) {
          expect(secondPage.value.files).toHaveLength(1);
          expect(secondPage.value.files[0].id.toString()).toBe(
            fakeMedias[1].id.toString()
          );
        }
      }
    });
  });

  describe("Error scenarios", () => {
    it("should return InternalServerError when repository fails to fetch medias", async () => {
      // Arrange
      mediaRepository.shouldFail = true;

      // Act
      const result = await sut.execute({ userId: "invalid-user-id" });

      // Assert
      expect(result.isLeft()).toBe(true);
      if (result.isLeft()) {
        expect(result.value.errorType).toBe("INTERNAL_SERVER_ERROR");
      }
    });
  });
});
