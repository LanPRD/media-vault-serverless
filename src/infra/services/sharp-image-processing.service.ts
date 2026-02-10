import type {
  ImageProcessingService,
  ThumbnailOptions
} from "@/domain/services/image-processing.service";
import sharp from "sharp";

export class SharpImageProcessingService implements ImageProcessingService {
  private readonly defaultWidth = 200;
  private readonly defaultHeight = 200;
  private readonly defaultQuality = 80;

  async generateThumbnail(
    input: Buffer,
    options?: ThumbnailOptions
  ): Promise<Buffer> {
    const width = options?.width ?? this.defaultWidth;
    const height = options?.height ?? this.defaultHeight;
    const quality = options?.quality ?? this.defaultQuality;

    return sharp(input)
      .resize(width, height, {
        fit: "cover",
        position: "center"
      })
      .jpeg({ quality })
      .toBuffer();
  }
}
