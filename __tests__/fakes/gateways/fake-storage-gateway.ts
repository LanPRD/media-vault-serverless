import type { ContentType, S3Key } from "@/domain/value-objects";
import type { StorageGateway } from "@/domain/gateways/storage-gateway";

export class FakeStorageGateway implements StorageGateway {
  public uploadUrls: Map<string, string> = new Map();
  public shouldFail = false;

  async generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
    expiresIn?: number;
  }): Promise<{ url: string; expiresIn: number }> {
    if (this.shouldFail) {
      throw new Error("Storage service unavailable");
    }

    const url = `https://s3.amazonaws.com/bucket/${params.key.value}?signed=true`;
    const expiresIn = params.expiresIn ?? 300;

    this.uploadUrls.set(params.key.value, url);

    return { url, expiresIn };
  }

  async generateDownloadUrl(
    key: S3Key
  ): Promise<{ url: string; expiresIn: number }> {
    if (this.shouldFail) {
      throw new Error("Storage service unavailable");
    }

    return {
      url: `https://s3.amazonaws.com/bucket/${key.value}?signed=true`,
      expiresIn: 300
    };
  }
}
