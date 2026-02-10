import { env } from "@/infra/env";
import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";
import { verify } from "jsonwebtoken";

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

type AuthorizerResult =
  APIGatewaySimpleAuthorizerWithContextResult<TokenPayload>;

export async function handler(
  event: APIGatewayRequestAuthorizerEventV2
): Promise<AuthorizerResult> {
  const awsAuthorization = event.headers?.authorization; // AWS specific authorization
  const commonAuthorization = event.headers?.Authorization; // normal header authorization
  const token = (awsAuthorization ?? commonAuthorization)?.replace(
    "Bearer ",
    ""
  );

  if (!token) {
    return {
      isAuthorized: false,
      context: createContext("", "", "")
    };
  }

  try {
    const decoded = verify(token, env.JWT_SECRET) as TokenPayload;

    return {
      isAuthorized: true,
      context: createContext(decoded.sub, decoded.email, decoded.name)
    };
  } catch {
    return {
      isAuthorized: false,
      context: createContext("", "", "")
    };
  }
}

function createContext(sub: string, email: string, name: string): TokenPayload {
  return { sub, email, name };
}
