import { DownloadFileUseCase } from "@/application/use-cases/medias/download-file";
import { UniqueEntityId } from "@/core/entities";
import { InternalError, NotFoundError } from "@/core/errors";
import { FakeMedia } from "__tests__/fakes/entities";
import { FakeMediaRepository } from "__tests__/fakes/repositories/fake-media-repository";
import { FakeStorageService } from "__tests__/fakes/services/fake-storage-gateway";

describe("DownloadFileUseCase", () => {
  let mediaRepository: FakeMediaRepository;
  let storageService: FakeStorageService;
  let sut: DownloadFileUseCase;

  beforeEach(() => {
    mediaRepository = new FakeMediaRepository();
    storageService = new FakeStorageService();
    sut = new DownloadFileUseCase(mediaRepository, storageService);
  });

  describe("Success scenarios", () => {
    it("should generate valid URL download", async () => {
      // Arrange
      const fileId = new UniqueEntityId();
      const ownerId = new UniqueEntityId();
      const media = FakeMedia.build({}, ownerId, fileId);

      await mediaRepository.save(media);

      // Act
      const result = await sut.execute({
        fileId: fileId.toString(),
        ownerId: ownerId.toString(),
        createdAt: media.createdAt.toISOString()
      });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.downloadUrl).toBeTruthy();
        expect(result.value.fileName).toBe(media.fileName.value);
      }
    });
  });

  describe("Error scenarios", () => {
    it("should return NotFoundError when media does not exist", async () => {
      // Arrange
      const fileId = new UniqueEntityId("random-id");
      const ownerId = new UniqueEntityId("random-id");
      const media = FakeMedia.build();

      await mediaRepository.save(media);

      // Act
      const result = await sut.execute({
        fileId: fileId.toString(),
        ownerId: ownerId.toString(),
        createdAt: media.createdAt.toISOString()
      });

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(NotFoundError);
      }
    });

    it("should return InternalServerError when storage service fails", async () => {
      // Arrange
      const fileId = new UniqueEntityId();
      const ownerId = new UniqueEntityId();
      const media = FakeMedia.build({}, ownerId, fileId);

      await mediaRepository.save(media);
      storageService.shouldFail = true;

      // Act
      const result = await sut.execute({
        fileId: fileId.toString(),
        ownerId: ownerId.toString(),
        createdAt: media.createdAt.toISOString()
      });

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value).toBeInstanceOf(InternalError);
      }
    });
  });
});
