import { env } from "@/infra/env";
import {
  CreateTableCommand,
  DeleteTableCommand,
  DescribeTableCommand,
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

const { tableSchema } = require("../../serverless/table-schema.js");

const localstackConfig = {
  endpoint: "http://localhost:4566",
  region: "sa-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" }
};

const dynamoClient = new DynamoDBClient(localstackConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ ...localstackConfig, forcePathStyle: true });

export class IntegrationSetup {
  private static tableCreated = false;
  private static bucketCreated = false;

  static async setup(): Promise<void> {
    await Promise.all([this.createTable(), this.createBucket()]);
  }

  static async cleanup(): Promise<void> {
    await Promise.all([this.clearTable(), this.clearBucket()]);
  }

  static async teardown(): Promise<void> {
    await Promise.all([this.deleteTable(), this.deleteBucket()]);
    this.tableCreated = false;
    this.bucketCreated = false;
  }

  private static async createTable(): Promise<void> {
    if (this.tableCreated) return;

    try {
      await dynamoClient.send(
        new CreateTableCommand({
          TableName: env.MEDIA_TABLE_NAME,
          BillingMode: "PAY_PER_REQUEST",
          ...tableSchema
        })
      );
      await this.waitForTable();
      this.tableCreated = true;
    } catch (error) {
      if ((error as Error).name === "ResourceInUseException") {
        this.tableCreated = true;
        return;
      }
      throw error;
    }
  }

  private static async waitForTable(): Promise<void> {
    let isActive = false;
    while (!isActive) {
      const { Table } = await dynamoClient.send(
        new DescribeTableCommand({ TableName: env.MEDIA_TABLE_NAME })
      );
      isActive = Table?.TableStatus === "ACTIVE";
      if (!isActive) await new Promise(r => setTimeout(r, 100));
    }
  }

  private static async createBucket(): Promise<void> {
    if (this.bucketCreated) return;

    try {
      await s3Client.send(
        new CreateBucketCommand({ Bucket: env.MEDIA_BUCKET_NAME })
      );
      this.bucketCreated = true;
    } catch (error) {
      if ((error as Error).name === "BucketAlreadyOwnedByYou") {
        this.bucketCreated = true;
        return;
      }
      throw error;
    }
  }

  private static async clearTable(): Promise<void> {
    const { Items } = await docClient.send(
      new ScanCommand({ TableName: env.MEDIA_TABLE_NAME })
    );

    if (!Items?.length) return;

    await Promise.all(
      Items.map(item =>
        docClient.send(
          new DeleteCommand({
            TableName: env.MEDIA_TABLE_NAME,
            Key: { PK: item.PK, SK: item.SK }
          })
        )
      )
    );
  }

  private static async clearBucket(): Promise<void> {
    try {
      const { Contents } = await s3Client.send(
        new ListObjectsV2Command({ Bucket: env.MEDIA_BUCKET_NAME })
      );

      if (!Contents?.length) return;

      await s3Client.send(
        new DeleteObjectsCommand({
          Bucket: env.MEDIA_BUCKET_NAME,
          Delete: { Objects: Contents.map(o => ({ Key: o.Key })) }
        })
      );
    } catch {
      // Ignore if bucket doesn't exist
    }
  }

  private static async deleteTable(): Promise<void> {
    try {
      await dynamoClient.send(
        new DeleteTableCommand({ TableName: env.MEDIA_TABLE_NAME })
      );
    } catch {
      // Ignore if table doesn't exist
    }
  }

  private static async deleteBucket(): Promise<void> {
    try {
      await this.clearBucket();
      await s3Client.send(
        new DeleteBucketCommand({ Bucket: env.MEDIA_BUCKET_NAME })
      );
    } catch {
      // Ignore if bucket doesn't exist
    }
  }
}
