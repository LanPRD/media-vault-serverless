import { BadRequestError } from "@/core/errors";

export class FileSize {
  public readonly value: number;
  private static readonly KB = 1024;
  private static readonly MAX_SIZE_MB = 10;

  private constructor(value: number) {
    this.value = value;
  }

  static create(bytes: number): FileSize {
    if (!FileSize.isValid(bytes)) {
      throw new BadRequestError(
        "Please provide a size between 1 byte and 10 MB."
      );
    }

    return new FileSize(bytes);
  }

  private static isValid(bytes: number): boolean {
    return (
      bytes > 0 && bytes <= FileSize.MAX_SIZE_MB * FileSize.KB * FileSize.KB
    );
  }

  toMB(): number {
    return this.value / (FileSize.KB * FileSize.KB);
  }

  toString(): string {
    const decimals = 2;
    return `${this.toMB().toFixed(decimals)} MB`;
  }
}
