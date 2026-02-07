import { left, right, type Either } from "@/core/either";
import { EnumContentType } from "../enums";

export class ContentType {
  public readonly value: EnumContentType;
  private static TYPES_ALLOWED = ["image/jpeg", "image/png", "video/mp4"];

  private constructor(value: EnumContentType) {
    this.value = value;
  }

  static create(contentType: EnumContentType): Either<Error, ContentType> {
    if (!this.isValid(contentType)) {
      return left(
        new Error("Invalid content type, only JPEG, PNG, and MP4 are allowed.")
      );
    }

    return right(new ContentType(contentType));
  }

  static isValid(contentType: EnumContentType): boolean {
    return ContentType.TYPES_ALLOWED.includes(contentType);
  }

  isImage(): boolean {
    return (
      this.value === EnumContentType.JPEG || this.value === EnumContentType.PNG
    );
  }

  isVideo(): boolean {
    return this.value === EnumContentType.MP4;
  }
}
