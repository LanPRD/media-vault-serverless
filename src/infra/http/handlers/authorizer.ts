import { env } from "@/infra/env";
import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult
} from "aws-lambda";
import { verify } from "jsonwebtoken";

export interface TokenPayload {
  sub: string;
  email: string;
}

type AuthorizerResult =
  APIGatewaySimpleAuthorizerWithContextResult<TokenPayload>;

export async function handler(
  event: APIGatewayRequestAuthorizerEventV2
): Promise<AuthorizerResult> {
  const token = event.headers?.Authorization?.replace("Bearer ", "");

  if (!token) {
    return {
      isAuthorized: false,
      context: createContext("", "")
    };
  }

  try {
    const decoded = verify(token, env.JWT_SECRET) as TokenPayload;

    console.log("Authorizing request:", decoded);

    return {
      isAuthorized: true,
      context: createContext(decoded.sub, decoded.email)
    };
  } catch {
    return {
      isAuthorized: false,
      context: createContext("", "")
    };
  }
}

function createContext(sub: string, email: string): TokenPayload {
  return { sub, email };
}

// {
//   sub: "user_123",            // subject → QUEM é o usuário (ID interno)
//   iss: "https://auth.meuapp.com", // issuer → QUEM emitiu o token
//   aud: "media-api",           // audience → PARA QUEM o token é válido
//   iat: 1709000000,            // issued at → QUANDO o token foi criado (epoch)
//   exp: 1709003600,            // expiration → ATÉ QUANDO confiar no token

//   email: "allan@email.com",   // claim custom → dado de conveniência (não é identidade)
//   role: "user"                // claim custom → papel/perfil do usuário
// }
