import type { APIGatewayProxyResultV2, Context, S3Event } from "aws-lambda";
import { HandlerResponse } from "../response";
import { ProcessUploadUseCase } from "@/application/use-cases/medias/process-upload";
import { ValidationError } from "@/core/errors";

const useCase = new ProcessUploadUseCase();

export async function handler(
  event: S3Event,
  context: Context
): Promise<APIGatewayProxyResultV2> {
  console.log("Processing upload event:", JSON.stringify(event));
  console.log("Context:", JSON.stringify(context));

  const key = event.Records[0].s3.object.key;
  const fileExtension = key.split(".").pop();

  if (!fileExtension) {
    return HandlerResponse.error(new ValidationError("Invalid file extension"));
  }

  await useCase.execute({
    extension: fileExtension,
    bucket: event.Records[0].s3.bucket.name,
    key: key
  });

  return HandlerResponse.ok({ message: "Upload processed successfully" });
}
