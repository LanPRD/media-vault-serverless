import type {
  DefaultStorageOutput,
  StorageService
} from "@/domain/services/storage.service";
import type { ContentType, S3Key } from "@/domain/value-objects";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

const isTest = env.NODE_ENV === "test";

const s3Client = new S3Client(
  isTest ?
    {
      endpoint: "http://localhost:4566",
      region: "sa-east-1",
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
      forcePathStyle: true
    }
  : {}
);

export class S3StorageService implements StorageService {
  private readonly s3 = s3Client;
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

  async getObject(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key
    });

    const response = await this.s3.send(command);
    const byteArray = await response.Body?.transformToByteArray();

    if (!byteArray) {
      throw new Error("Failed to retrieve object from S3");
    }

    return Buffer.from(byteArray);
  }

  async putObject(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType
    });

    await this.s3.send(command);
  }
}
