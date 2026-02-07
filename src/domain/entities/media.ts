import { Entity, type UniqueEntityId } from "@/core/entities";
import { ContentType, FileName, FileSize, MediaStatus } from "../value-objects";
import type { Optional } from "@/core/types/optional";
import { EnumMediaStatus } from "../enums";

interface MediaProps {
  ownerId: UniqueEntityId;
  fileName: FileName;
  fileSize: FileSize;
  contentType: ContentType;
  s3Key: string;
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

  get s3Key(): string {
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
    props: Optional<MediaProps, "createdAt" | "updatedAt">,
    id?: UniqueEntityId
  ): Media {
    return new Media(
      {
        ...props,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      id
    );
  }

  startProcessing(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.PROCESSING)) {
      throw new Error(
        `Cannot transition from ${this.props.status.value} to processing`
      );
    }

    const statusResult = MediaStatus.create(EnumMediaStatus.PROCESSING);

    if (statusResult.isLeft()) {
      throw statusResult.value;
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = new Date();
  }

  attachThumbnail(thumbnailKey: string): void {
    if (!this.props.contentType.isImage()) {
      throw new Error("Only images can have thumbnails");
    }

    this.props.thumbnail = thumbnailKey;
    this.props.updatedAt = new Date();
  }

  markAsReady(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.READY)) {
      throw new Error(
        `Cannot transition from ${this.props.status.value} to ready`
      );
    }

    const statusResult = MediaStatus.create(EnumMediaStatus.READY);

    if (statusResult.isLeft()) {
      throw statusResult.value;
    }

    this.props.status = statusResult.value;
    this.props.updatedAt = new Date();
  }

  markAsFailed(): void {
    if (!this.props.status.canTransitionTo(EnumMediaStatus.FAILED)) {
      throw new Error(
        `Cannot transition from ${this.props.status.value} to failed`
      );
    }

    const statusResult = MediaStatus.create(EnumMediaStatus.FAILED);

    if (statusResult.isLeft()) {
      throw statusResult.value;
    }

    this.props.status = statusResult.value;
    this.props.thumbnail = undefined;
    this.props.updatedAt = new Date();
  }
}
