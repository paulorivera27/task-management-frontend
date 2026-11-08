import type { TFunction } from "i18next";
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

// The API answers in English; known messages are translated, anything else is shown as received.
const SERVER_MESSAGES: [RegExp, string][] = [
  [/^Invalid email or password\.?$/, "errors.invalid_credentials"],
  [/^Email has already been taken$/, "errors.email_taken"],
  [/^Email is invalid$/, "errors.email_invalid"],
  [/^Email can't be blank$/, "errors.email_blank"],
  [/^Password is too short \(minimum is (\d+) characters?\)$/, "errors.password_short"],
  [/^Password is too long$/, "errors.password_long"],
  [/^Password can't be blank$/, "errors.password_blank"],
  [/^Title can't be blank$/, "errors.title_blank"],
  [/^(Task with ID .+ not found\.?|Not found)$/, "errors.task_not_found"],
];

export function translateServerMessage(message: string, t: TFunction): string {
  for (const [pattern, key] of SERVER_MESSAGES) {
    const match = pattern.exec(message);
    if (match) return t(key, { min: match[1] });
  }
  return message;
}
