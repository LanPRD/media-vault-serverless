import { RequestUploadUrlUseCase } from "@/application/use-cases/medias/request-upload-url";
import { UniqueEntityId } from "@/core/entities";
import { EnumMediaStatus } from "@/domain/enums";
import { FakeStorageService } from "../../fakes/services/fake-storage-gateway";
import { FakeMediaRepository } from "../../fakes/repositories/fake-media-repository";

describe("RequestUploadUrlUseCase", () => {
  let sut: RequestUploadUrlUseCase;
  let mediaRepository: FakeMediaRepository;
  let storageGateway: FakeStorageService;

  beforeEach(() => {
    mediaRepository = new FakeMediaRepository();
    storageGateway = new FakeStorageService();
    sut = new RequestUploadUrlUseCase(mediaRepository, storageGateway);
  });

  describe("Success scenarios", () => {
    it.each([
      ["JPEG image", "image/jpeg"],
      ["PNG image", "image/png"],
      ["MP4 video", "video/mp4"]
    ])("should generate upload URL for valid %s", async (_, contentType) => {
      // Arrange & Act
      const result = await sut.execute({
        ownerId: "owner-id",
        fileName: "file.jpg",
        fileSize: 1024,
        contentType
      });

      // Assert
      expect(result.isRight()).toBe(true);
      expect(mediaRepository.medias).toHaveLength(1);
      expect(storageGateway.uploadUrls.size).toBe(1);
    });

    it("should persist media in repository with UPLOADING status", async () => {
      // Arrange
      const contentType = "image/jpeg";
      const expectedStatus = EnumMediaStatus.UPLOADING;

      // Act
      const result = await sut.execute({
        ownerId: "owner-id",
        fileName: "image.jpg",
        fileSize: 1024,
        contentType: contentType
      });

      // Assert
      expect(result.isRight()).toBe(true);
      expect(mediaRepository.medias[0].status.value).toBe(expectedStatus);
      expect(storageGateway.uploadUrls.size).toBe(1);
    });

    it("should return fileId matching persisted media", async () => {
      // Arrange
      const contentType = "image/jpeg";

      // Act
      const result = await sut.execute({
        ownerId: "owner-id",
        fileName: "image.jpg",
        fileSize: 1024,
        contentType: contentType
      });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(mediaRepository.medias[0].id.toString()).toBe(
          result.value.fileId
        );
      }

      expect(storageGateway.uploadUrls.size).toBe(1);
    });

    it("should return presigned URL from storage gateway", async () => {
      // Arrange
      const contentType = "image/jpeg";

      // Act
      const result = await sut.execute({
        ownerId: "owner-id",
        fileName: "image.jpg",
        fileSize: 1024,
        contentType: contentType
      });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        const storedUrls = Array.from(storageGateway.uploadUrls.values());

        expect(storedUrls).toContain(result.value.uploadUrl);
        expect(result.value.uploadUrl).toContain("https://");
        expect(result.value.uploadUrl).toContain("s3.amazonaws.com");
      }
    });

    it("should return correct expiresIn value", async () => {
      // Arrange
      const contentType = "image/jpeg";
      const expectedExpiresIn = 300; // 300 seconds (5 minutes)

      // Act
      const result = await sut.execute({
        ownerId: "owner-id",
        fileName: "image.jpg",
        fileSize: 1024,
        contentType: contentType
      });

      // Assert
      expect(result.isRight()).toBe(true);

      if (result.isRight()) {
        expect(result.value.expiresIn).toBe(expectedExpiresIn);
      }
    });
  });

  describe("Validation errors", () => {
    describe("fileName", () => {
      it("should return error when fileName contains invalid characters", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();

        // Act
        const result = await sut.execute({
          contentType: "image/jpeg",
          fileSize: 1024 * 1024 * 5,
          fileName: "invalid!file.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_FILE_NAME");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });

      it("should return error when fileName is empty", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();

        // Act
        const result = await sut.execute({
          contentType: "image/jpeg",
          fileSize: 1024 * 1024 * 5,
          fileName: "",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_FILE_NAME");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });
    });

    describe("fileSize", () => {
      it("should return error when fileSize exceeds 10MB", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();
        const fileSize = 1024 * 1024 * 11;

        // Act
        const result = await sut.execute({
          contentType: "image/jpeg",
          fileSize: fileSize,
          fileName: "valid.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_FILE_SIZE");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });

      it("should return error when fileSize is zero", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();
        const fileSize = 0;

        // Act
        const result = await sut.execute({
          contentType: "image/jpeg",
          fileSize: fileSize,
          fileName: "valid.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_FILE_SIZE");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });

      it("should return error when fileSize is negative", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();
        const fileSize = -1024 * 1024 * 5;

        // Act
        const result = await sut.execute({
          contentType: "image/jpeg",
          fileSize: fileSize,
          fileName: "valid.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_FILE_SIZE");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });
    });

    describe("contentType", () => {
      it("should return error when contentType is not allowed", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();
        const fileSize = 1024 * 1024 * 5;
        const contentType = "image/gif";

        // Act
        const result = await sut.execute({
          contentType: contentType,
          fileSize: fileSize,
          fileName: "valid.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_CONTENT_TYPE");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });

      it("should return error when contentType is empty", async () => {
        // Arrange
        const ownerId = new UniqueEntityId();
        const fileSize = 1024 * 1024 * 5;
        const contentType = "";

        // Act
        const result = await sut.execute({
          contentType: contentType,
          fileSize: fileSize,
          fileName: "valid.jpg",
          ownerId: ownerId.toString()
        });

        // Assert
        expect(result.isLeft()).toBe(true);

        if (result.isLeft()) {
          expect(result.value.errorType).toBe("INVALID_CONTENT_TYPE");
        }

        expect(mediaRepository.medias).toHaveLength(0);
        expect(storageGateway.uploadUrls.size).toBe(0);
      });
    });
  });

  describe("Infrastructure errors", () => {
    it("should return error when storage gateway fails", async () => {
      // Arrange
      const ownerId = new UniqueEntityId();
      const fileSize = 1024 * 1024 * 5;
      const contentType = "image/png";
      storageGateway.shouldFail = true;

      // Act
      const result = await sut.execute({
        contentType: contentType,
        fileSize: fileSize,
        fileName: "valid.jpg",
        ownerId: ownerId.toString()
      });

      // Assert
      expect(result.isLeft()).toBe(true);

      if (result.isLeft()) {
        expect(result.value.errorType).toBe("INTERNAL_ERROR");
      }

      expect(mediaRepository.medias).toHaveLength(0);
      expect(storageGateway.uploadUrls.size).toBe(0);
    });
  });
});
