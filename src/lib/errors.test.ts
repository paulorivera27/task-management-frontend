import { describe, expect, it } from "vitest";
import {
  isUnauthenticated,
  errorMessageKey,
  SessionExpiredError,
  RefreshUnavailableError,
} from "./errors";
import { CombinedGraphQLErrors, ServerError } from "@apollo/client/errors";

const graphqlError = (message: string, code?: string) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message, ...(code ? { extensions: { code } } : {}) }],
  });

const serverError = (status: number) =>
  new ServerError("failed", {
    response: new Response(null, { status }),
    bodyText: "",
  });

describe("isUnauthenticated", () => {
  it("matches the UNAUTHENTICATED code whatever the message says", () => {
    expect(isUnauthenticated(graphqlError("Please log in", "UNAUTHENTICATED"))).toBe(true);
  });

  it("falls back to the legacy message", () => {
    expect(isUnauthenticated(graphqlError("Authentication required"))).toBe(true);
  });

  it("ignores other GraphQL errors and non-GraphQL errors", () => {
    expect(isUnauthenticated(graphqlError("Task with ID 1 not found."))).toBe(false);
    expect(isUnauthenticated(new Error("Authentication required"))).toBe(false);
    expect(isUnauthenticated(undefined)).toBe(false);
  });
});

describe("errorMessageKey", () => {
  it("maps session problems", () => {
    expect(errorMessageKey(new SessionExpiredError())).toBe("errors.session_expired");
    expect(errorMessageKey(graphqlError("x", "UNAUTHENTICATED"))).toBe("errors.session_expired");
  });

  it("maps rate limiting and other HTTP failures", () => {
    expect(errorMessageKey(serverError(429))).toBe("errors.too_many_requests");
    expect(errorMessageKey(serverError(500))).toBe("errors.server");
  });

  it("maps connectivity failures", () => {
    expect(errorMessageKey(new TypeError("Failed to fetch"))).toBe("errors.network");
    expect(errorMessageKey(new RefreshUnavailableError())).toBe("errors.network");
  });

  it("tells a rate-limited or failing refresh endpoint from a network failure", () => {
    expect(errorMessageKey(new RefreshUnavailableError(429))).toBe("errors.too_many_requests");
    expect(errorMessageKey(new RefreshUnavailableError(503))).toBe("errors.server");
  });

  it("falls back to the generic message", () => {
    expect(errorMessageKey(graphqlError("boom"))).toBe("errors.generic");
    expect(errorMessageKey("nope")).toBe("errors.generic");
  });
});
