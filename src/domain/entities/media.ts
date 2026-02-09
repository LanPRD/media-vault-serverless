import { Entity, UniqueEntityId } from "@/core/entities";
import { AppError, BadRequestError, HttpStatus } from "@/core/errors";
import type { Optional } from "@/core/types/optional";
import { EnumMediaStatus } from "../enums";
import { ContentType, FileName, FileSize, MediaStatus } from "../value-objects";
import type { S3Key } from "../value-objects/s3-key";

interface MediaProps {
  ownerId: UniqueEntityId;
  fileName: FileName;
  fileSize: FileSize;
  contentType: ContentType;
  s3Key: S3Key;
  thumbnail?: string;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Media extends Entity<MediaProps> {
  get ownerId(): UniqueEntityId {
    return this.props.ownerId;
  }

  get fileName(): FileName {
    return this.props.fileName;
  }

  get fileSize(): FileSize {
    return this.props.fileSize;
  }

  get contentType(): ContentType {
    return this.props.contentType;
  }

  get s3Key(): S3Key {
    return this.props.s3Key;
  }

  get thumbnail(): string | undefined {
    return this.props.thumbnail;
  }

  get status(): MediaStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(
    props: Optional<MediaProps, "createdAt" | "updatedAt" | "status">,
    id?: UniqueEntityId
  ): Media {
    return new Media(
      {
        ...props,
        status: props.status ?? MediaStatus.create(),
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date()
      },
      id ?? new UniqueEntityId()
    );
  }

  startProcessing(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.PROCESSING)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "INVALID_STATUS_TRANSITION",
        `Cannot transition from ${this.props.status.value} to ${EnumMediaStatus.PROCESSING}`
      );
    }

    this.props.status = MediaStatus.create(EnumMediaStatus.PROCESSING);
    this.props.updatedAt = new Date();
  }

  attachThumbnail(thumbnailKey: string): void {
    if (!this.props.contentType.isImage()) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        "THUMBNAIL_NOT_ALLOWED",
        "Only images can have thumbnails"
      );
    }

    this.props.thumbnail = thumbnailKey;
    this.props.updatedAt = new Date();
  }

  markAsReady(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.READY)) {
      throw new BadRequestError(
        `Cannot transition from ${this.props.status.value} to ${EnumMediaStatus.READY}`
      );
    }

    this.props.status = MediaStatus.create(EnumMediaStatus.READY);
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.FAILED)) {
      throw new BadRequestError(
        `Cannot transition from ${this.props.status.value} to ${EnumMediaStatus.FAILED}`
      );
    }

    this.props.status = MediaStatus.create(EnumMediaStatus.FAILED);
    this.props.thumbnail = undefined;
    this.props.updatedAt = new Date();
  }
}
