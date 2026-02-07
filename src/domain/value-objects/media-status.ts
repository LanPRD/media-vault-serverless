import { EnumMediaStatus } from "../enums";

export class MediaStatus {
  public readonly value: EnumMediaStatus;

  private static readonly STRING_TO_ENUM: Record<string, EnumMediaStatus> = {
    uploading: EnumMediaStatus.UPLOADING,
    processing: EnumMediaStatus.PROCESSING,
    ready: EnumMediaStatus.READY,
    failed: EnumMediaStatus.FAILED
  };

  private static readonly ALLOWED_TRANSITIONS: Record<
    EnumMediaStatus,
    EnumMediaStatus[]
  > = {
    [EnumMediaStatus.UPLOADING]: [
      EnumMediaStatus.PROCESSING,
      EnumMediaStatus.FAILED
    ],
    [EnumMediaStatus.PROCESSING]: [
      EnumMediaStatus.READY,
      EnumMediaStatus.FAILED
    ],
    [EnumMediaStatus.READY]: [],
    [EnumMediaStatus.FAILED]: []
  };

  private constructor(value: EnumMediaStatus) {
    this.value = value;
  }

  static create(status?: string | EnumMediaStatus): MediaStatus {
    if (!status) {
      return new MediaStatus(EnumMediaStatus.UPLOADING);
    }

    if (Object.values(EnumMediaStatus).includes(status as EnumMediaStatus)) {
      return new MediaStatus(status as EnumMediaStatus);
    }

    const mappedValue = MediaStatus.STRING_TO_ENUM[status];

    if (!mappedValue) {
      throw new Error(
        "Invalid media status. Please use one of the following: uploading, processing, ready, or failed."
      );
    }

    return new MediaStatus(mappedValue);
  }

  canTransitionTo(nextStatus: EnumMediaStatus): boolean {
    return MediaStatus.ALLOWED_TRANSITIONS[this.value].includes(nextStatus);
  }
}
