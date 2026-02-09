import { HttpStatus } from "../http-status";
import { AppError } from "./app-error";

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
  }
}
