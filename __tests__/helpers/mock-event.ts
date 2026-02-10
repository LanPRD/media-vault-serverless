import type { TokenPayload } from "@/infra/http/handlers/authorizer";
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface MockEventOptions {
  method?: HttpMethod;
  path?: string;
  body?: Record<string, unknown>;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  headers?: Record<string, string>;
  authorizer?: Partial<TokenPayload>;
}

export function createMockEvent(
  options: MockEventOptions = {}
): APIGatewayProxyEventV2WithLambdaAuthorizer<TokenPayload> {
  const method = options.method ?? "POST";
  const path = options.path ?? "/";

  return {
    version: "2.0",
    routeKey: `${method} ${path}`,
    rawPath: path,
    rawQueryString: new URLSearchParams(
      options.queryStringParameters
    ).toString(),
    headers: options.headers ?? {},
    requestContext: {
      accountId: "123456789012",
      apiId: "test-api",
      authorizer: {
        lambda: {
          sub: options.authorizer?.sub ?? "test-user-id",
          email: options.authorizer?.email ?? "test@example.com",
          name: options.authorizer?.name ?? "Test User"
        }
      },
      domainName: "localhost",
      domainPrefix: "test",
      http: {
        method,
        path,
        protocol: "HTTP/1.1",
        sourceIp: "127.0.0.1",
        userAgent: "vitest"
      },
      requestId: crypto.randomUUID(),
      routeKey: `${method} ${path}`,
      stage: "test",
      time: new Date().toISOString(),
      timeEpoch: Date.now()
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    pathParameters: options.pathParameters,
    queryStringParameters: options.queryStringParameters,
    isBase64Encoded: false
  };
}
