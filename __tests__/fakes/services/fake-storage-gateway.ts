import type {
  DefaultStorageOutput,
  StorageService
} from "@/domain/services/storage.service";
import type { ContentType, S3Key } from "@/domain/value-objects";

export class FakeStorageService implements StorageService {
  public uploadUrls: Map<string, string> = new Map();
  public shouldFail = false;

  async generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
  }): Promise<DefaultStorageOutput> {
    if (this.shouldFail) {
      throw new Error("Storage service unavailable");
    }

    const url = `https://s3.amazonaws.com/bucket/${params.key.value}?signed=true`;
    const expiresIn = 300;

    this.uploadUrls.set(params.key.value, url);

    return { url, expiresIn };
  }

  async generateDownloadUrl(key: S3Key): Promise<DefaultStorageOutput> {
    if (this.shouldFail) {
      throw new Error("Storage service unavailable");
    }

    return {
      url: `https://s3.amazonaws.com/bucket/${key.value}?signed=true`,
      expiresIn: 300
    };
  }
}
