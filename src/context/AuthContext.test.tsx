import { useState } from "react";
import { gql } from "@apollo/client";
import { useAuth } from "./useAuth";
import { describe, expect, it } from "vitest";
import client, { getAccessToken } from "../lib/apollo";
import { renderPage } from "../test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  status,
  mockLogout,
  mockRefresh,
  mockGraphql,
  sessionBody,
  UNAUTHENTICATED,
} from "../test/api";

function Probe() {
  const auth = useAuth();
  const [loggedOut, setLoggedOut] = useState<string>("");

  return (
    <div>
      <p data-testid="state">
        {auth.loading
          ? "loading"
          : auth.isAuthenticated
            ? `in:${auth.user?.email}`
            : "out"}
      </p>
      <p data-testid="expired">{String(auth.sessionExpired)}</p>
      <p data-testid="logout-result">{loggedOut}</p>
      <button onClick={async () => setLoggedOut(String(await auth.logout()))}>
        logout
      </button>
    </div>
  );
}

const state = () => screen.getByTestId("state").textContent;

describe("AuthProvider", () => {
  it("shows loading until the startup refresh settles, then restores the session", async () => {
    mockRefresh(() => sessionBody("t1"));
    renderPage(<Probe />);

    expect(state()).toBe("loading");
    await waitFor(() => expect(state()).toBe("in:user@example.com"));
    expect(getAccessToken()).toBe("t1");
  });

  it("is signed out when there is no valid refresh token", async () => {
    mockRefresh(() => status(401));
    renderPage(<Probe />);

    await waitFor(() => expect(state()).toBe("out"));
  });

  it("stops loading and stays signed out when the refresh endpoint fails", async () => {
    mockRefresh(() => status(429));
    renderPage(<Probe />);

    await waitFor(() => expect(state()).toBe("out"));
  });

  it("sends one refresh request under StrictMode's double mount", async () => {
    const calls = mockRefresh(() => sessionBody());
    renderPage(<Probe />, { strict: true });

    await waitFor(() => expect(state()).toBe("in:user@example.com"));
    expect(calls).toHaveLength(1);
  });

  it("logs out: revokes server-side, clears the token and the cache", async () => {
    mockRefresh(() => sessionBody());
    const logouts = mockLogout(() => status(204));
    client.writeQuery({
      query: gql`query Cached { cached }`,
      data: { cached: "yes" },
    });
    renderPage(<Probe />);
    await waitFor(() => expect(state()).toBe("in:user@example.com"));

    await userEvent.click(screen.getByText("logout"));

    await waitFor(() => expect(state()).toBe("out"));
    expect(screen.getByTestId("logout-result")).toHaveTextContent("true");
    expect(logouts).toHaveLength(1);
    expect(getAccessToken()).toBeNull();
    expect(client.cache.extract()).toEqual({});
  });

  it("stays signed in when the server could not revoke the session", async () => {
    mockRefresh(() => sessionBody());
    mockLogout(() => status(500));
    renderPage(<Probe />);
    await waitFor(() => expect(state()).toBe("in:user@example.com"));

    await userEvent.click(screen.getByText("logout"));

    await waitFor(() =>
      expect(screen.getByTestId("logout-result")).toHaveTextContent("false"),
    );
    expect(state()).toBe("in:user@example.com");
    expect(getAccessToken()).not.toBeNull();
  });

  it("signs out and flags the expiry when a request proves the session is gone", async () => {
    let refreshes = 0;
    mockRefresh(() => (refreshes++ === 0 ? sessionBody() : status(401)));
    mockGraphql({ GetTasks: () => UNAUTHENTICATED });
    renderPage(<Probe />);
    await waitFor(() => expect(state()).toBe("in:user@example.com"));
    expect(screen.getByTestId("expired")).toHaveTextContent("false");

    await client
      .query({ query: gql`query GetTasks { tasks { totalCount } }`, fetchPolicy: "network-only" })
      .catch(() => {});

    await waitFor(() => expect(state()).toBe("out"));
    expect(screen.getByTestId("expired")).toHaveTextContent("true");
    expect(client.cache.extract()).toEqual({});
  });
});
