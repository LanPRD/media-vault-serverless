import { faker } from "@faker-js/faker";
import type { Context } from "aws-lambda";

interface FakeLambdaContextOptions {
  functionName?: string;
  memoryLimitInMB?: string;
  awsRequestId?: string;
}

export function createFakeLambdaContext(
  options: FakeLambdaContextOptions = {}
): Context {
  const functionName =
    options.functionName ?? `lambda-${faker.word.noun()}-${faker.word.verb()}`;
  const awsRequestId = options.awsRequestId ?? faker.string.uuid();

  return {
    callbackWaitsForEmptyEventLoop: true,
    functionVersion: "$LATEST",
    functionName,
    memoryLimitInMB: options.memoryLimitInMB ?? "1024",
    logGroupName: `/aws/lambda/${functionName}`,
    logStreamName: `${faker.date.recent().toISOString().split("T")[0].replace(/-/g, "/")}/$LATEST]${faker.string.hexadecimal({ length: 32, casing: "lower", prefix: "" })}`,
    invokedFunctionArn: `arn:aws:lambda:sa-east-1:${faker.string.numeric(12)}:function:${functionName}`,
    awsRequestId,
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  };
}
