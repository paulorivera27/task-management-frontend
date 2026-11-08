import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

// The refresh endpoint could not be reached or answered with a non-401 failure; the session may still be valid.
export class RefreshUnavailableError extends Error {
  readonly status?: number;

  constructor(status?: number) {
    super("Session refresh unavailable");
    this.name = "RefreshUnavailableError";
    this.status = status;
  }
}

// Backend contract: extensions.code is authoritative, the message is kept for older API versions.
export function isUnauthenticated(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some(
      (e) =>
        e.extensions?.code === "UNAUTHENTICATED" ||
        e.message === "Authentication required",
    )
  );
}

export function errorMessageKey(error: unknown): string {
  if (error instanceof SessionExpiredError || isUnauthenticated(error)) {
    return "errors.session_expired";
  }
  if (ServerError.is(error)) {
    return error.statusCode === 429
      ? "errors.too_many_requests"
      : "errors.server";
  }
  if (error instanceof RefreshUnavailableError) {
    if (error.status === 429) return "errors.too_many_requests";
    return error.status ? "errors.server" : "errors.network";
  }
  if (error instanceof TypeError) return "errors.network";
  return "errors.generic";
}
