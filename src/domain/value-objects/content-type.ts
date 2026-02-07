import { DomainErrors } from "../errors";
import { EnumContentType } from "../enums";

export class ContentType {
  public readonly value: EnumContentType;

  private static readonly STRING_TO_ENUM: Record<string, EnumContentType> = {
    "image/jpeg": EnumContentType.JPEG,
    "image/png": EnumContentType.PNG,
    "video/mp4": EnumContentType.MP4
  };

  private constructor(value: EnumContentType) {
    this.value = value;
  }

  static create(contentType: string): ContentType {
    const mappedValue = ContentType.STRING_TO_ENUM[contentType];

    if (!mappedValue) {
      throw DomainErrors.INVALID_CONTENT_TYPE(
        "Only JPEG, PNG, and MP4 are allowed."
      );
    }

    return new ContentType(mappedValue);
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
