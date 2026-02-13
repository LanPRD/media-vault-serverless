import { UniqueEntityId } from "@/core/entities";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import type { ListFilesResponseDto } from "@/infra/http/dtos";
import { handler } from "@/infra/http/handlers/list-files";
import { DynamoFakeMedia } from "__tests__/fakes/entities";
import {
  createMockEvent,
  expectSuccess,
  getStatusCode,
  IntegrationSetup
} from "__tests__/helpers";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

describe("Handler: list-files", () => {
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

  it("should return a list of files", async () => {
    // Arrange
    const ownerId = new UniqueEntityId();
    await dynamoFakeMedia.build({
      ownerId,
      createdAt: new Date("2026-02-11T10:00:00Z")
    });
    await dynamoFakeMedia.build({
      ownerId,
      createdAt: new Date("2026-02-11T09:00:00Z")
    });

    // Act
    const event = createMockEvent({
      authorizer: { sub: ownerId.toString() }
    });

    const result = await handler(event);
    const body = expectSuccess<ListFilesResponseDto>(result);

    // Assert
    expect(getStatusCode(result)).toBe(200);
    expect(body.files).toHaveLength(2);
    expect(body.files[0].ownerId).toBe(ownerId.toString());
  });

  it("should paginate the list of files using cursor", async () => {
    // Arrange
    const ownerId = new UniqueEntityId();
    const media1 = await dynamoFakeMedia.build({
      ownerId,
      createdAt: new Date("2026-02-11T12:00:00Z")
    });
    const media2 = await dynamoFakeMedia.build({
      ownerId,
      createdAt: new Date("2026-02-11T11:00:00Z")
    });
    const media3 = await dynamoFakeMedia.build({
      ownerId,
      createdAt: new Date("2026-02-11T10:00:00Z")
    });

    // Act - First page
    const firstPageEvent = createMockEvent({
      authorizer: { sub: ownerId.toString() },
      queryStringParameters: { limit: "2" }
    });

    const firstPageResult = await handler(firstPageEvent);
    const firstPageBody = expectSuccess<ListFilesResponseDto>(firstPageResult);

    // Assert - First page
    expect(getStatusCode(firstPageResult)).toBe(200);
    expect(firstPageBody.files).toHaveLength(2);
    expect(firstPageBody.files[0].id).toBe(media1.id.toString());
    expect(firstPageBody.files[1].id).toBe(media2.id.toString());
    expect(firstPageBody.nextCursor).not.toBeNull();

    // Act - Second page using cursor
    const secondPageEvent = createMockEvent({
      authorizer: { sub: ownerId.toString() },
      queryStringParameters: {
        limit: "2",
        lastMediaId: firstPageBody.nextCursor!.mediaId,
        lastCreatedAt: firstPageBody.nextCursor!.createdAt
      }
    });

    const secondPageResult = await handler(secondPageEvent);
    const secondPageBody =
      expectSuccess<ListFilesResponseDto>(secondPageResult);

    // Assert - Second page
    expect(getStatusCode(secondPageResult)).toBe(200);
    expect(secondPageBody.files).toHaveLength(1);
    expect(secondPageBody.files[0].id).toBe(media3.id.toString());
    expect(secondPageBody.nextCursor).toBeNull();
  });
});
