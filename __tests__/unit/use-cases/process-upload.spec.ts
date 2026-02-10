import { ProcessUploadUseCase } from "@/application/use-cases/medias/process-upload";
import { EnumMediaStatus } from "@/domain/enums";
import { FakeMedia } from "__tests__/fakes/entities/fake-media";
import { FakeMediaRepository } from "__tests__/fakes/repositories/fake-media-repository";
import { FakeImageProcessingService } from "__tests__/fakes/services/fake-image-processing.service";
import { FakeStorageService } from "__tests__/fakes/services/fake-storage-gateway";

describe("ProcessUploadUseCase", () => {
  let imageProcessingService: FakeImageProcessingService;
  let mediaRepository: FakeMediaRepository;
  let storageService: FakeStorageService;
  let sut: ProcessUploadUseCase;

  beforeEach(() => {
    imageProcessingService = new FakeImageProcessingService();
    mediaRepository = new FakeMediaRepository();
    storageService = new FakeStorageService();
    sut = new ProcessUploadUseCase(
      mediaRepository,
      storageService,
      imageProcessingService
    );
  });

  describe("Success scenarios", () => {
    it("should process upload and generate thumbnail", async () => {
      const fakeMedia = FakeMedia.build();
      const s3Key = fakeMedia.s3Key.value;

      await mediaRepository.save(fakeMedia);
      storageService.objects.set(s3Key, Buffer.from("fake-image-data"));

      const result = await sut.execute(s3Key);

      expect(result.isRight()).toBe(true);

      const updatedMedia = await mediaRepository.findByS3Key(s3Key);
      expect(updatedMedia?.status.value).toBe(EnumMediaStatus.READY);
      expect(updatedMedia?.thumbnail).toContain("thumbnails/");
    });

    it("should upload thumbnail to storage", async () => {
      const fakeMedia = FakeMedia.build();
      const s3Key = fakeMedia.s3Key.value;

      await mediaRepository.save(fakeMedia);
      storageService.objects.set(s3Key, Buffer.from("fake-image-data"));

      await sut.execute(s3Key);

      const thumbnailKey = `thumbnails/${fakeMedia.ownerId.toString()}/${fakeMedia.id.toString()}.jpg`;
      expect(storageService.objects.has(thumbnailKey)).toBe(true);
    });
  });

  describe("Error scenarios", () => {
    it("should return NotFoundError when media does not exist", async () => {
      const result = await sut.execute("non-existent-key");

      expect(result.isLeft()).toBe(true);
    });

    it("should return error when storage service fails", async () => {
      const fakeMedia = FakeMedia.build();
      const s3Key = fakeMedia.s3Key.value;

      await mediaRepository.save(fakeMedia);
      storageService.shouldFail = true;

      const result = await sut.execute(s3Key);

      expect(result.isLeft()).toBe(true);
    });

    it("should return error when image processing fails", async () => {
      const fakeMedia = FakeMedia.build();
      const s3Key = fakeMedia.s3Key.value;

      await mediaRepository.save(fakeMedia);
      storageService.objects.set(s3Key, Buffer.from("fake-image-data"));
      imageProcessingService.shouldFail = true;

      const result = await sut.execute(s3Key);

      expect(result.isLeft()).toBe(true);
    });
  });
});
