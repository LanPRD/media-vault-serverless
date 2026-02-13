import { DownloadFileUseCase } from "@/application/use-cases/medias/download-file";
import { ValidationError } from "@/core/errors";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { S3StorageService } from "@/infra/services/s3-storage.service";
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";
import { DownloadFilePathSchema, type DownloadFileResponseDto } from "../dtos";
import { HandlerResponse } from "../response";
import type { TokenPayload } from "./authorizer";

const mediaRepository = new DynamoDBMediaRepository();
const storageService = new S3StorageService();
const useCase = new DownloadFileUseCase(mediaRepository, storageService);

export async function handler(
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<TokenPayload>
) {
  const parsed = DownloadFilePathSchema.safeParse(event.pathParameters ?? {});

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(i => `${i.path.join(".")}: ${i.message}`)
      .join("; ");

    return HandlerResponse.error(new ValidationError(issues));
  }

  const userId = event.requestContext.authorizer.lambda.sub;
  const { fileId, createdAt } = parsed.data;

  const result = await useCase.execute({
    fileId,
    createdAt,
    ownerId: userId
  });

  if (result.isLeft()) {
    return HandlerResponse.error(result.value);
  }

  return HandlerResponse.ok<DownloadFileResponseDto>(result.value);
}
