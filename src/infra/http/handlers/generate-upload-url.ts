import { RequestUploadUrlUseCase } from "@/application/use-cases/medias/request-upload-url";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import { S3StorageService } from "@/infra/services/s3-storage.service";
import type {
  APIGatewayProxyEventV2WithLambdaAuthorizer,
  APIGatewayProxyResultV2
} from "aws-lambda";
import { generateUploadUrlBodySchema } from "../dtos/generate-upload-url.dto";
import { ErrorMap } from "../errors";
import type { TokenPayload } from "./authorizer";

const storageGateway = new S3StorageService();
const mediaRepository = new DynamoDBMediaRepository();
const useCase = new RequestUploadUrlUseCase(mediaRepository, storageGateway);

export async function handler(
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<TokenPayload>
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

    const userId = event.requestContext.authorizer.lambda.sub;

    const result = await useCase.execute({
      ownerId: userId,
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
