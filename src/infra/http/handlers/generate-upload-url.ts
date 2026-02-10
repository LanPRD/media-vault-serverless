import { RequestUploadUrlUseCase } from "@/application/use-cases/medias/request-upload-url";
import { ValidationError } from "@/core/errors";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { S3StorageService } from "@/infra/services/s3-storage.service";
import type {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2
} from "aws-lambda";
import {
  GenerateUploadUrlRequestSchema,
  type GenerateUploadUrlResponseDto
} from "../dtos";
import { HandlerResponse } from "../response";
import type { TokenPayload } from "./authorizer";

const storageGateway = new S3StorageService();
const mediaRepository = new DynamoDBMediaRepository();
const useCase = new RequestUploadUrlUseCase(mediaRepository, storageGateway);

export async function handler(
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<TokenPayload>
): Promise<APIGatewayProxyResultV2> {
  const parsed = GenerateUploadUrlRequestSchema.safeParse(
    JSON.parse(event.body ?? "{}")
  );

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(i => `${i.path.join(".")}: ${i.message}`)
      .join("; ");

    return HandlerResponse.error(new ValidationError(issues));
  }

  const userId = event.requestContext.authorizer.lambda.sub;

  const result = await useCase.execute({
    ownerId: userId,
    ...parsed.data
  });

  if (result.isLeft()) {
    return HandlerResponse.error(result.value);
  }

  return HandlerResponse.created<GenerateUploadUrlResponseDto>(result.value);
}
