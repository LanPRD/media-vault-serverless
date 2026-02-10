import type { ContentType, S3Key } from "../value-objects";

export interface DefaultStorageOutput {
  url: string;
  expiresIn: number;
}

export interface StorageService {
  generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
  }): Promise<DefaultStorageOutput>;

  generateDownloadUrl(key: S3Key): Promise<DefaultStorageOutput>;

  getObject(key: string): Promise<Buffer>;

  putObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void>;
}
