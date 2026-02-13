import { ListFilesUseCase } from "@/application/use-cases/medias/list-files";
import { ValidationError } from "@/core/errors";
import { DynamoDBMediaRepository } from "@/infra/database/repositories/dynamodb-media.repository";
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";
import {
  ListFilesRequestQuerySchema,
  type ListFilesResponseDto
} from "../dtos";
import { ListFilesPresenter } from "../presenters/list-files.presenter";
import { HandlerResponse } from "../response";
import type { TokenPayload } from "./authorizer";

const mediaRepository = new DynamoDBMediaRepository();
const useCase = new ListFilesUseCase(mediaRepository);

export async function handler(
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<TokenPayload>
) {
  const parsed = ListFilesRequestQuerySchema.safeParse(
    event.queryStringParameters ?? {}
  );

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(i => `${i.path.join(".")}: ${i.message}`)
      .join("; ");

    return HandlerResponse.error(new ValidationError(issues));
  }

  const userId = event.requestContext.authorizer.lambda.sub;
  const { lastMediaId, lastCreatedAt, limit } = parsed.data;

  const result = await useCase.execute({
    userId,
    lastMediaId,
    lastCreatedAt,
    limit
  });

  if (result.isLeft()) {
    return HandlerResponse.error(result.value);
  }

  return HandlerResponse.ok<ListFilesResponseDto>(
    ListFilesPresenter.toHTTP(result.value)
  );
}
