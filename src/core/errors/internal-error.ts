import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class InternalError extends AppError {
  constructor(message = "An unexpected error occurred") {
    super(HttpStatus.INTERNAL, "INTERNAL_ERROR", message);
  }
}
