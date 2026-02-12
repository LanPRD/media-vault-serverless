import { ProcessUploadUseCase } from "@/application/use-cases/medias/process-upload";
import { BadRequestError, ValidationError } from "@/core/errors";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { S3StorageService } from "@/infra/services/s3-storage.service";
import { SharpImageProcessingService } from "@/infra/services/sharp-image-processing.service";
import type { APIGatewayProxyResultV2, Context, S3Event } from "aws-lambda";
import { HandlerResponse } from "../response";

const storageService = new S3StorageService();
const mediaRepository = new DynamoDBMediaRepository();
const imageProcessingService = new SharpImageProcessingService();
const useCase = new ProcessUploadUseCase(
  mediaRepository,
  storageService,
  imageProcessingService
);

export async function handler(
  event: S3Event,
  _context: Context
): Promise<APIGatewayProxyResultV2> {
  const key = event.Records[0].s3.object.key;

  if (!key.startsWith("media/")) {
    return HandlerResponse.error(new BadRequestError("Invalid file path"));
  }

  const fileExtension = key.split(".").pop();

  if (!fileExtension) {
    return HandlerResponse.error(new ValidationError("Invalid file extension"));
  }

  const result = await useCase.execute({ key, fileExtension });

  if (result.isLeft()) {
    return HandlerResponse.error(result.value);
  }

  return HandlerResponse.ok({ message: "Upload processed successfully" });
}
