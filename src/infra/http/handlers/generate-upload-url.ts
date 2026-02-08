import { RequestUploadUrlUseCase } from "@/application/use-cases/medias/request-upload-url";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { S3StorageGateway } from "@/infra/gateways/s3-storage.gateway";
import type { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { generateUploadUrlBodySchema } from "../dtos/generate-upload-url.dto";
import { ErrorMap } from "../errors";

const mediaRepository = new DynamoDBMediaRepository();
const storageGateway = new S3StorageGateway();
const useCase = new RequestUploadUrlUseCase(mediaRepository, storageGateway);

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> {
  try {
    const parsed = generateUploadUrlBodySchema.safeParse(
      JSON.parse(event.body ?? "{}")
    );

    if (!parsed.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "VALIDATION_ERROR",
          issues: parsed.error.issues
        })
      };
    }

    // const userId = event.requestContext.authorizer?.userId;

    const result = await useCase.execute({
      ownerId: "userId",
      ...parsed.data
    });

    if (result.isLeft()) {
      return ErrorMap.mapUnknownErrorToHttpResponse(result.value);
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.value)
    };
  } catch (_error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" })
    };
  }
}
