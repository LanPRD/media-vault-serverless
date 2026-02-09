import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to access this resource") {
    super(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
  }
}
