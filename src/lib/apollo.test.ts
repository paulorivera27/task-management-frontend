import { gql } from "@apollo/client";
import { describe, expect, it, vi } from "vitest";
import { SessionExpiredError, RefreshUnavailableError } from "./errors";
import { mockGraphql, mockRefresh, mockLogout, sessionBody, status, UNAUTHENTICATED } from "../test/api";
import client, { getAccessToken, logoutFromServer, onSessionLost, refreshSession, setAccessToken } from "./apollo";

const TASKS = gql`
  query GetTasks {
    tasks {
      totalCount
    }
  }
`;
const ok = { data: { tasks: { totalCount: 3, __typename: "TasksResult" } } };
const TASKS_PAGE = gql`
  query GetTasks($offset: Int) {
    tasks(offset: $offset) {
      totalCount
    }
  }
`;
const query = () => client.query({ query: TASKS, fetchPolicy: "network-only" });
// Distinct variables keep Apollo from merging identical in-flight queries into one request.
const queryPage = (offset: number) =>
  client.query({ query: TASKS_PAGE, variables: { offset }, fetchPolicy: "network-only" });

describe("refreshSession", () => {
  it("shares one request between concurrent callers", async () => {
    const calls = mockRefresh(() => sessionBody());
    const [a, b, c] = await Promise.all([refreshSession(), refreshSession(), refreshSession()]);

    expect(calls).toHaveLength(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("stores the token and normalises the numeric user id", async () => {
    mockRefresh(() => sessionBody("abc"));

    await expect(refreshSession()).resolves.toEqual({
      token: "abc",
      user: { id: "7", email: "user@example.com" },
    });
    expect(getAccessToken()).toBe("abc");
  });

  it("starts a new request once the previous one settled", async () => {
    const calls = mockRefresh(() => sessionBody());
    await refreshSession();
    await refreshSession();

    expect(calls).toHaveLength(2);
  });

  it("resolves null and clears the token on 401", async () => {
    setAccessToken("stale");
    mockRefresh(() => status(401, { error: "Invalid or expired refresh token" }));

    await expect(refreshSession()).resolves.toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it.each([429, 500, 503])("keeps the token and rejects on %i", async (code) => {
    setAccessToken("still-valid");
    mockRefresh(() => status(code));

    await expect(refreshSession()).rejects.toMatchObject({ status: code });
    await expect(refreshSession()).rejects.toBeInstanceOf(RefreshUnavailableError);
    expect(getAccessToken()).toBe("still-valid");
  });

  it("rejects on a malformed body", async () => {
    mockRefresh(() => ({ token: 5 }));

    await expect(refreshSession()).rejects.toBeInstanceOf(RefreshUnavailableError);
  });

  it("rejects when the network stays down, after one retry", async () => {
    const calls = mockRefresh(() => Response.error());

    await expect(refreshSession()).rejects.toBeInstanceOf(RefreshUnavailableError);
    expect(calls).toHaveLength(2);
  });

  it("recovers when only the first attempt is lost", async () => {
    let attempt = 0;
    const calls = mockRefresh(() => (attempt++ === 0 ? Response.error() : sessionBody("recovered")));

    await expect(refreshSession()).resolves.toMatchObject({ token: "recovered" });
    expect(calls).toHaveLength(2);
  });

  it("does not retry a definitive answer", async () => {
    const calls = mockRefresh(() => status(401));

    await expect(refreshSession()).resolves.toBeNull();
    expect(calls).toHaveLength(1);
  });
});

describe("logoutFromServer", () => {
  it("is true when the server revoked the session", async () => {
    const calls = mockLogout(() => status(204));

    await expect(logoutFromServer()).resolves.toBe(true);
    expect(calls).toHaveLength(1);
  });

  it("is false on a failed response or a network error", async () => {
    mockLogout(() => status(500));
    await expect(logoutFromServer()).resolves.toBe(false);

    mockLogout(() => Response.error());
    await expect(logoutFromServer()).resolves.toBe(false);
  });
});

describe("error link", () => {
  it("refreshes once and retries with the new token after UNAUTHENTICATED", async () => {
    setAccessToken("expired");
    const refreshes = mockRefresh(() => sessionBody("fresh"));
    const calls = mockGraphql({
      GetTasks: ({ authorization }) => (authorization === "Bearer fresh" ? ok : UNAUTHENTICATED),
    });

    const { data } = await query();

    expect(data).toMatchObject({ tasks: { totalCount: 3 } });
    expect(refreshes).toHaveLength(1);
    expect(calls.map((c) => c.authorization)).toEqual(["Bearer expired", "Bearer fresh"]);
  });

  it("sends a single refresh for parallel failing requests", async () => {
    setAccessToken("expired");
    const refreshes = mockRefresh(() => sessionBody("fresh"));
    const calls = mockGraphql({
      GetTasks: ({ authorization }) => (authorization === "Bearer fresh" ? ok : UNAUTHENTICATED),
    });

    await Promise.all([queryPage(0), queryPage(10), queryPage(20)]);

    expect(calls.filter((c) => c.authorization === "Bearer expired")).toHaveLength(3);
    expect(refreshes).toHaveLength(1);
  });

  it("does not retry forever when the retry is rejected too", async () => {
    setAccessToken("expired");
    const refreshes = mockRefresh(() => sessionBody("fresh"));
    const calls = mockGraphql({ GetTasks: () => UNAUTHENTICATED });

    await expect(query()).rejects.toBeDefined();

    expect(refreshes).toHaveLength(1);
    expect(calls).toHaveLength(2);
  });

  it("reports a lost session when the refresh token is rejected", async () => {
    const listener = vi.fn();
    const off = onSessionLost(listener);
    mockRefresh(() => status(401));
    mockGraphql({ GetTasks: () => UNAUTHENTICATED });

    await expect(query()).rejects.toBeInstanceOf(SessionExpiredError);
    expect(listener).toHaveBeenCalledOnce();
    off();
  });

  it("does not report a lost session when the refresh endpoint is only unavailable", async () => {
    const listener = vi.fn();
    const off = onSessionLost(listener);
    mockRefresh(() => status(429));
    mockGraphql({ GetTasks: () => UNAUTHENTICATED });

    await expect(query()).rejects.toBeInstanceOf(RefreshUnavailableError);
    expect(listener).not.toHaveBeenCalled();
    off();
  });

  it("leaves other GraphQL errors alone", async () => {
    const refreshes = mockRefresh(() => sessionBody());
    mockGraphql({ GetTasks: () => ({ data: null, errors: [{ message: "Task with ID 1 not found." }] }) });

    await expect(query()).rejects.toBeDefined();
    expect(refreshes).toHaveLength(0);
  });

  it("stops notifying removed listeners", async () => {
    const listener = vi.fn();
    onSessionLost(listener)();
    mockRefresh(() => status(401));
    mockGraphql({ GetTasks: () => UNAUTHENTICATED });

    await query().catch(() => {});
    expect(listener).not.toHaveBeenCalled();
  });
});
