import type {
  DefaultStorageOutput,
  StorageGateway
} from "@/domain/gateways/storage-gateway";
import type { ContentType, S3Key } from "@/domain/value-objects";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

export class S3StorageGateway implements StorageGateway {
  private readonly s3 = new S3Client({});
  private readonly bucketName = env.MEDIA_BUCKET_NAME;
  private readonly defaultExpiresInSeconds = 300;

  async generateUploadUrl(params: {
    key: S3Key;
    contentType: ContentType;
  }): Promise<DefaultStorageOutput> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key.value,
      ContentType: params.contentType.value
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: this.defaultExpiresInSeconds
    });

    return { url, expiresIn: this.defaultExpiresInSeconds };
  }

  async generateDownloadUrl(key: S3Key): Promise<DefaultStorageOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key.value
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: this.defaultExpiresInSeconds
    });

    return { url, expiresIn: this.defaultExpiresInSeconds };
  }
}
