import { left, right, type Either } from "@/core/either";
import { EnumMediaStatus } from "../enums";

export class MediaStatus {
  public readonly value: EnumMediaStatus;

  private constructor(value: EnumMediaStatus) {
    this.value = value;
  }

  static create(status?: EnumMediaStatus): Either<Error, MediaStatus> {
    const sts = status || EnumMediaStatus.UPLOADING;

    if (!this.isValid(sts)) {
      return left(
        new Error(
          "Invalid media status. Please use one of the following: uploading, processing, ready, or failed."
        )
      );
    }

    return right(new MediaStatus(sts));
  }

  static isValid(status: EnumMediaStatus): boolean {
    return [
      EnumMediaStatus.UPLOADING,
      EnumMediaStatus.PROCESSING,
      EnumMediaStatus.READY,
      EnumMediaStatus.FAILED
    ].includes(status);
  }

  canTransitionTo(nextStatus: EnumMediaStatus): boolean {
    const allowedTransitions: Record<EnumMediaStatus, EnumMediaStatus[]> = {
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

    return allowedTransitions[this.value].includes(nextStatus);
  }
}
