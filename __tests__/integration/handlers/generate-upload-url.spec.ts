import type { GenerateUploadUrlResponseDto } from "@/infra/http/dtos/generate-upload-url.dto";
import { handler } from "@/infra/http/handlers/generate-upload-url";
import {
  createMockEvent,
  expectError,
  expectSuccess,
  getStatusCode,
  IntegrationSetup
} from "__tests__/helpers";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

describe("Handler: generate-upload-url", () => {
  beforeAll(async () => {
    await IntegrationSetup.setup();
  });

  afterEach(async () => {
    await IntegrationSetup.cleanup();
  });

  afterAll(async () => {
    await IntegrationSetup.teardown();
  });

  it("should generate presigned URL for authenticated user", async () => {
    const event = createMockEvent({
      body: {
        fileName: "photo.jpg",
        fileSize: 1024,
        contentType: "image/jpeg"
      },
      authorizer: { sub: "user-123" }
    });

    const result = await handler(event);
    const body = expectSuccess<GenerateUploadUrlResponseDto>(result);

    expect(getStatusCode(result)).toBe(201);
    expect(body.uploadUrl).toBeDefined();
    expect(body.uploadUrl).toContain("localhost:4566");
    expect(body.fileId).toBeDefined();
  });

  it("should return 400 for missing fileName", async () => {
    const event = createMockEvent({
      body: {
        fileSize: 1024,
        contentType: "image/jpeg"
      },
      authorizer: { sub: "user-123" }
    });

    const result = await handler(event);
    const error = expectError(result, 400);

    expect(error.error).toBe("VALIDATION_ERROR");
  });

  it("should return 400 for invalid contentType", async () => {
    const event = createMockEvent({
      body: {
        fileName: "file.exe",
        fileSize: 1024,
        contentType: "application/exe"
      },
      authorizer: { sub: "user-123" }
    });

    const result = await handler(event);
    const error = expectError(result, 400);

    expect(error.error).toBe("VALIDATION_ERROR");
  });

  it("should return 400 for negative fileSize", async () => {
    const event = createMockEvent({
      body: {
        fileName: "photo.jpg",
        fileSize: -100,
        contentType: "image/jpeg"
      },
      authorizer: { sub: "user-123" }
    });

    const result = await handler(event);

    expectError(result, 400);
  });
});
