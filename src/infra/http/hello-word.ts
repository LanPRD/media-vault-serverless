import { APIGatewayProxyResultV2 } from "aws-lambda";

export async function hello(): Promise<APIGatewayProxyResultV2> {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
}
