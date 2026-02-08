export class S3Key {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(
    ownerId: string,
    mediaId: string,
    fileExtension: string
  ): S3Key {
    return new S3Key(this.generateKey(ownerId, mediaId, fileExtension));
  }

  static fromString(key: string): S3Key {
    return new S3Key(key);
  }

  private static generateKey(
    ownerId: string,
    mediaId: string,
    fileExtension: string
  ): string {
    return `media/${ownerId}/${mediaId}.${fileExtension}`;
  }
}
