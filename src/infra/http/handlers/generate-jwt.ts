import { GenerateJWTUseCase } from "@/application/use-cases/user/generate-jwt";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { HandlerResponse } from "../response";

const useCase = new GenerateJWTUseCase();

export async function handler(_event: APIGatewayProxyEventV2) {
  const token = await useCase.execute();
  return HandlerResponse.ok({ token });
}
