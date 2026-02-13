import { UniqueEntityId } from "@/core/entities";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import type { DownloadFileResponseDto } from "@/infra/http/dtos/download-file.dto";
import { handler } from "@/infra/http/handlers/download-file";
import { DynamoFakeMedia } from "__tests__/fakes/entities";
import {
  createMockEvent,
  expectError,
  expectSuccess,
  getStatusCode,
  IntegrationSetup
} from "__tests__/helpers";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

describe("Handler: download-file", () => {
  const mediaRepository = new DynamoDBMediaRepository();
  const dynamoFakeMedia = new DynamoFakeMedia(mediaRepository);

  beforeAll(async () => {
    await IntegrationSetup.setup();
  });

  afterEach(async () => {
    await IntegrationSetup.cleanup();
  });

  afterAll(async () => {
    await IntegrationSetup.teardown();
  });

  it("should generate download URL for authenticated user", async () => {
    // Act
    const userId = new UniqueEntityId();
    const fakeMedia = await dynamoFakeMedia.build({}, userId);

    const event = createMockEvent({
      authorizer: { sub: userId.toString() },
      pathParameters: {
        fileId: fakeMedia.id.toString(),
        createdAt: fakeMedia.createdAt.toISOString()
      }
    });

    // Act
    const result = await handler(event);
    const body = expectSuccess<DownloadFileResponseDto>(result);

    // Assert
    expect(getStatusCode(result)).toBe(200);
    expect(body.downloadUrl).toBeDefined();
    expect(body.downloadUrl).toContain("localhost:4566");
    expect(body.expiresIn).toBe(300);
  });

  it("should return 400 for missing fileId", async () => {
    // Act
    const userId = new UniqueEntityId();
    const fakeMedia = await dynamoFakeMedia.build({}, userId);

    const event = createMockEvent({
      authorizer: { sub: userId.toString() },
      pathParameters: {
        createdAt: fakeMedia.createdAt.toISOString()
      }
    });

    // Act
    const result = await handler(event);
    const error = expectError(result, 400);

    // Assert
    expect(getStatusCode(result)).toBe(400);
    expect(error.error).toBe("VALIDATION_ERROR");
  });

  it("should return 400 for missing createdAt", async () => {
    // Act
    const userId = new UniqueEntityId();
    const fakeMedia = await dynamoFakeMedia.build({}, userId);

    const event = createMockEvent({
      authorizer: { sub: userId.toString() },
      pathParameters: {
        fileId: fakeMedia.id.toString()
      }
    });

    // Act
    const result = await handler(event);
    const error = expectError(result, 400);

    // Assert
    expect(getStatusCode(result)).toBe(400);
    expect(error.error).toBe("VALIDATION_ERROR");
  });
});
