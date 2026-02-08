import { env } from "@/infra/env";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isTest = env.NODE_ENV === "test";

const client = new DynamoDBClient(
  isTest ?
    {
      endpoint: "http://localhost:4566",
      region: "sa-east-1",
      credentials: { accessKeyId: "test", secretAccessKey: "test" }
    }
  : {}
);

export const docClient = DynamoDBDocumentClient.from(client);
