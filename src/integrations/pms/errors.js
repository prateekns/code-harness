export class ProjectManagementError extends Error {
  constructor({
    message,
    code = "PROJECT_MANAGEMENT_ERROR",
    provider = "unknown",
    statusCode = null,
    retryable = false,
    cause = null,
  }) {
    super(message);

    this.name = "ProjectManagementError";

    this.code = code;

    this.provider = provider;

    this.statusCode = statusCode;

    this.retryable = retryable;

    this.cause = cause;
  }
}