import type {
  ImageProcessingService,
  ThumbnailOptions
} from "@/domain/services/image-processing.service";

export class FakeImageProcessingService implements ImageProcessingService {
  public shouldFail = false;
  public generatedThumbnails: Buffer[] = [];

  async generateThumbnail(
    input: Buffer,
    _options?: ThumbnailOptions
  ): Promise<Buffer> {
    if (this.shouldFail) {
      throw new Error("Image processing failed");
    }

    const thumbnail = Buffer.from("fake-thumbnail-data");
    this.generatedThumbnails.push(thumbnail);

    return thumbnail;
  }
}
