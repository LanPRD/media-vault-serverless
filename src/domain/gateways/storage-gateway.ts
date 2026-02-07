import type { ContentType, S3Key } from "../value-objects";

export interface StorageGateway {
  generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
    expiresIn?: number;
  }): Promise<{ url: string; expiresIn: number }>;

  generateDownloadUrl(key: S3Key): Promise<{ url: string; expiresIn: number }>;
}
