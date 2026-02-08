import { UniqueEntityId } from "@/core/entities";
import { Media } from "@/domain/entities";
import {
  ContentType,
  FileName,
  FileSize,
  MediaStatus,
  S3Key
} from "@/domain/value-objects";

export interface DynamoDBMediaItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  s3Key: string;
  thumbnail?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export class DynamoDBMediaMapper {
  static toDomain(item: DynamoDBMediaItem): Media {
    const ownerId = new UniqueEntityId(item.PK.replace("USER#", ""));
    const mediaId = new UniqueEntityId(item.SK.replace("MEDIA#", ""));

    return Media.create(
      {
        ownerId,
        fileName: FileName.create(item.fileName),
        fileSize: FileSize.create(item.fileSize),
        contentType: ContentType.create(item.contentType),
        s3Key: S3Key.fromString(item.s3Key),
        thumbnail: item.thumbnail,
        status: MediaStatus.create(item.status),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      },
      mediaId
    );
  }

  static toDynamoDB(media: Media): DynamoDBMediaItem {
    const ownerId = media.ownerId.toString();
    const mediaId = media.id.toString();

    return {
      PK: `USER#${ownerId}`,
      SK: `MEDIA#${mediaId}`,
      GSI1PK: media.s3Key.value,
      GSI1SK: media.s3Key.value,
      fileName: media.fileName.value,
      fileSize: media.fileSize.value,
      contentType: media.contentType.value,
      s3Key: media.s3Key.value,
      thumbnail: media.thumbnail,
      status: media.status.value,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString()
    };
  }
}
