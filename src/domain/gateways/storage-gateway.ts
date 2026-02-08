import type { ContentType, S3Key } from "../value-objects";

export interface DefaultStorageOutput {
  url: string;
  expiresIn: number;
}

export interface StorageGateway {
  generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
  }): Promise<DefaultStorageOutput>;

  generateDownloadUrl(key: S3Key): Promise<DefaultStorageOutput>;
}
