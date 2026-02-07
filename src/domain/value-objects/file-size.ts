import { left, right, type Either } from "@/core/either";

export class FileSize {
  public readonly value: number;
  private static KB = 1024; // 1 KB = 1024 bytes
  private static MAX_SIZE_MB = 10; // 10 MB = 10 * 1024 KB

  private constructor(value: number) {
    this.value = value;
  }

  static create(bytes: number): Either<Error, FileSize> {
    if (!this.isValid(bytes)) {
      return left(
        new Error(
          "Invalid file size, please provide a number between 1 and 10 MB (inclusive)."
        )
      );
    }

    return right(new FileSize(bytes));
  }

  static isValid(bytes: number): boolean {
    return bytes > 0 && bytes <= this.MAX_SIZE_MB * this.KB * this.KB;
  }

  toMB(): number {
    const fileSizeInMB = this.value / (FileSize.KB * FileSize.KB);
    return fileSizeInMB;
  }

  toString(): string {
    return `${this.toMB()} MB`;
  }
}
