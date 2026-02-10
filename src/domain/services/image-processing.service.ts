export interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export interface ImageProcessingService {
  generateThumbnail(input: Buffer, options?: ThumbnailOptions): Promise<Buffer>;
}
