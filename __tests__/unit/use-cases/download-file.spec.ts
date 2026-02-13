import { DownloadFileUseCase } from "@/application/use-cases/medias/download-file";
import { UniqueEntityId } from "@/core/entities";

describe.only("DownloadFileUseCase", () => {
  let sut: DownloadFileUseCase;

  beforeEach(() => {
    sut = new DownloadFileUseCase();
  });

  describe("Success scenarios", () => {
    it("should generate JWT for valid user", async () => {
      // Arrange
      const fileId = new UniqueEntityId();
      const downloadUrl = await sut.execute(fileId.toString());

      // Act

      // Assert
      expect(downloadUrl).toBeTruthy();
    });
  });
});
