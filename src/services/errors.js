export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export class NotFoundError extends ApiError {
  constructor(message) {
    super(message, {
      status: 404,
      code: "NOT_FOUND",
    });

    this.name = "NotFoundError";
  }
}

export function shouldRetryQuery(failureCount, error) {
  const status = error?.status;

  if (
    Number.isInteger(status) &&
    status >= 400 &&
    status < 500
  ) {
    return false;
  }

  return failureCount < 2;
}
