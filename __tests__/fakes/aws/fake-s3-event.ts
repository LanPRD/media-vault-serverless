import { faker } from "@faker-js/faker";
import type { S3Event, S3EventRecord } from "aws-lambda";

interface FakeS3ObjectOptions {
  key?: string;
  size?: number;
  eTag?: string;
}

interface FakeS3EventOptions {
  bucketName?: string;
  bucketArn?: string;
  region?: string;
  eventName?:
    | "ObjectCreated:Put"
    | "ObjectCreated:Post"
    | "ObjectRemoved:Delete";
  object?: FakeS3ObjectOptions;
}

export function createFakeS3EventRecord(
  options: FakeS3EventOptions = {}
): S3EventRecord {
  const bucketName =
    options.bucketName ??
    `bucket-${faker.word.noun()}-${faker.helpers.arrayElement(["dev", "staging", "prod"])}`;
  const region = options.region ?? "sa-east-1";
  const userId = faker.string.uuid();
  const fileId = faker.string.uuid();
  const extension = faker.system.fileExt();

  return {
    eventVersion: "2.1",
    eventSource: "aws:s3",
    awsRegion: region,
    eventTime: faker.date.recent().toISOString(),
    eventName: options.eventName ?? "ObjectCreated:Put",
    userIdentity: {
      principalId: `AWS:${faker.string.alphanumeric({ length: 21, casing: "upper" })}:${bucketName}-generateUploadUrl`
    },
    requestParameters: {
      sourceIPAddress: faker.internet.ipv4()
    },
    responseElements: {
      "x-amz-request-id": faker.string.alphanumeric({
        length: 16,
        casing: "upper"
      }),
      "x-amz-id-2": faker.string.alphanumeric({ length: 76 })
    },
    s3: {
      s3SchemaVersion: "1.0",
      configurationId: `${bucketName}-processUploadFile-${faker.string.hexadecimal({ length: 32, casing: "lower", prefix: "" })}`,
      bucket: {
        name: bucketName,
        ownerIdentity: {
          principalId: faker.string.alphanumeric({
            length: 14,
            casing: "upper"
          })
        },
        arn: options.bucketArn ?? `arn:aws:s3:::${bucketName}`
      },
      object: {
        key: options.object?.key ?? `media/${userId}/${fileId}.${extension}`,
        size:
          options.object?.size ??
          faker.number.int({ min: 1000, max: 10000000 }),
        eTag:
          options.object?.eTag ??
          faker.string.hexadecimal({ length: 32, casing: "lower", prefix: "" }),
        sequencer: faker.string.hexadecimal({
          length: 18,
          casing: "upper",
          prefix: "00"
        })
      }
    }
  };
}

export function createFakeS3Event(
  options: FakeS3EventOptions | FakeS3EventOptions[] = {}
): S3Event {
  const records =
    Array.isArray(options) ?
      options.map(opt => createFakeS3EventRecord(opt))
    : [createFakeS3EventRecord(options)];

  return {
    Records: records
  };
}
