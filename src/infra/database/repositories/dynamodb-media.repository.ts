import type { UniqueEntityId } from "@/core/entities";
import type { Media } from "@/domain/entities";
import type {
  FindByOwnerIdParams,
  FindByOwnerIdResult,
  MediaRepository
} from "@/domain/repositories/media.repository";
import { env } from "@/infra/env";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../dynamodb/dynamodb.client";
import {
  DynamoDBMediaMapper,
  type DynamoDBMediaItem
} from "../mappers/dynamodb-media-mapper";

export class DynamoDBMediaRepository implements MediaRepository {
  private tableName = env.MEDIA_TABLE_NAME;

  async save(media: Media): Promise<void> {
    const item = DynamoDBMediaMapper.toDynamoDB(media);

    await docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item
      })
    );
  }

  async findByIdAndUserId(
    id: UniqueEntityId,
    userId: UniqueEntityId
  ): Promise<Media | null> {
    const pk = `USER#${userId.toString()}`;
    const mediaId = id.toString();

    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        FilterExpression: "contains(SK, :mediaId)",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":prefix": "MEDIA#",
          ":mediaId": mediaId
        },
        Limit: 1
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return DynamoDBMediaMapper.toDomain(result.Items[0] as DynamoDBMediaItem);
  }

  async findByOwnerId(
    props: FindByOwnerIdParams
  ): Promise<FindByOwnerIdResult> {
    const { ownerId, limit, cursor } = props;

    const pk = `USER#${ownerId.toString()}`;

    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
        ExpressionAttributeValues: {
          ":pk": pk,
          ":prefix": "MEDIA#"
        },
        Limit: limit,
        ExclusiveStartKey: cursor,
        ScanIndexForward: false
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        items: [],
        nextCursor: null
      };
    }

    return {
      items: result.Items.map(item =>
        DynamoDBMediaMapper.toDomain(item as DynamoDBMediaItem)
      ),
      nextCursor: result.LastEvaluatedKey ?? null
    };
  }

  async findByS3Key(s3Key: string): Promise<Media | null> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :s3Key",
        ExpressionAttributeValues: {
          ":s3Key": s3Key
        }
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return DynamoDBMediaMapper.toDomain(result.Items[0] as DynamoDBMediaItem);
  }
}
