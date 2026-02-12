import { UniqueEntityId } from "@/core/entities";
import { EnumContentType, EnumMediaStatus } from "@/domain/enums";
import { ContentType, S3Key } from "@/domain/value-objects";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { env } from "@/infra/env";
import { handler } from "@/infra/http/handlers/process-upload";
import { S3StorageService } from "@/infra/services/s3-storage.service";
import {
  createFakeLambdaContext,
  createFakeS3Event
} from "__tests__/fakes/aws";
import { FakeMedia } from "__tests__/fakes/entities";
import { getStatusCode, IntegrationSetup } from "__tests__/helpers";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

const VALID_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44,
  0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d,
  0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42,
  0x60, 0x82
]);

describe("Handler: process-upload", () => {
  const mediaRepository = new DynamoDBMediaRepository();
  const storageService = new S3StorageService();

  beforeAll(async () => {
    await IntegrationSetup.setup();
  });

  afterEach(async () => {
    await IntegrationSetup.cleanup();
  });

  afterAll(async () => {
    await IntegrationSetup.teardown();
  });

  it("should process uploaded image and generate thumbnail", async () => {
    const ownerId = new UniqueEntityId();
    const mediaId = new UniqueEntityId();
    const s3Key = S3Key.create(ownerId.toString(), mediaId.toString(), "png");

    const media = FakeMedia.build(
      {
        s3Key,
        contentType: ContentType.create(EnumContentType.PNG)
      },
      ownerId,
      mediaId
    );

    await mediaRepository.save(media);

    await storageService.putObject({
      key: s3Key.value,
      body: VALID_PNG_BUFFER,
      contentType: "image/png"
    });

    const event = createFakeS3Event({
      bucketName: env.MEDIA_BUCKET_NAME,
      object: { key: s3Key.value }
    });

    const context = createFakeLambdaContext();

    const result = await handler(event, context);
    const statusCode = getStatusCode(result);

    expect(statusCode).toBe(200);

    const updatedMedia = await mediaRepository.findByS3Key(s3Key.value);
    expect(updatedMedia).toBeDefined();
    expect(updatedMedia?.status.value).toBe(EnumMediaStatus.READY);
    expect(updatedMedia?.thumbnail).toBeDefined();
    expect(updatedMedia?.thumbnail).toContain("thumbnails/");
  });

  it("should return 404 when media not found in database", async () => {
    const ownerId = new UniqueEntityId();
    const mediaId = new UniqueEntityId();
    const key = `media/${ownerId.toString()}/${mediaId.toString()}.png`;

    await storageService.putObject({
      key,
      body: VALID_PNG_BUFFER,
      contentType: "image/png"
    });

    const event = createFakeS3Event({
      bucketName: env.MEDIA_BUCKET_NAME,
      object: { key }
    });

    const context = createFakeLambdaContext();

    const result = await handler(event, context);
    const statusCode = getStatusCode(result);

    expect(statusCode).toBe(404);
  });

  it("should return 400 for file without extension", async () => {
    const event = createFakeS3Event({
      bucketName: env.MEDIA_BUCKET_NAME,
      object: { key: "media/user-id/file-without-extension" }
    });

    const context = createFakeLambdaContext();

    const result = await handler(event, context);
    const statusCode = getStatusCode(result);

    expect(statusCode).toBe(400);
  });
});
