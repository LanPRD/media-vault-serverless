import { left, right, type Either } from "@/core/either";

export class FileName {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(fileName: string): Either<Error, FileName> {
    if (!FileName.isValid(fileName)) {
      return left(
        new Error(
          "Invalid file name, please use only alphanumeric characters, dots (.), underscores (_), and hyphens (-) in the file name."
        )
      );
    }

    return right(new FileName(fileName));
  }

  static isValid(fileName: string): boolean {
    const validChars = /^[a-zA-Z0-9._-]+$/;
    return validChars.test(fileName);
  }

  extension(): string {
    const lastDotIndex = this.value.lastIndexOf(".");
    return this.value.substring(lastDotIndex + 1);
  }

  sanitized(): string {
    return this.value
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/^[^a-zA-Z]+/, "")
      .replace(/[^a-zA-Z]+$/, "");
  }
}
