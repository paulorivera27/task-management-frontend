import {
  HttpLink,
  Observable,
  ApolloLink,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import type { Session } from "../types";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import {
  isUnauthenticated,
  SessionExpiredError,
  RefreshUnavailableError,
} from "./errors";

const API_BASE = import.meta.env.VITE_API_URL || "/graphql";
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin;

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const sessionLostListeners = new Set<() => void>();

export function onSessionLost(listener: () => void) {
  sessionLostListeners.add(listener);
  return () => {
    sessionLostListeners.delete(listener);
  };
}

// The REST endpoint serializes the numeric database id; GraphQL ids are strings.
function parseSession(value: unknown): Session | null {
  const v = value as { token?: unknown; user?: { id?: unknown; email?: unknown } };
  const { id, email } = v?.user ?? {};
  if (typeof v?.token !== "string" || typeof email !== "string") return null;
  if (typeof id !== "string" && typeof id !== "number") return null;
  return { token: v.token, user: { id: String(id), email } };
}

async function requestRefresh(): Promise<Session | null> {
  let res: Response;
  try {
    res = await fetch(`${API_ORIGIN}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    throw new RefreshUnavailableError();
  }

  // Only a 401 means the refresh token is gone; 429 and 5xx must not log the user out.
  if (res.status === 401) {
    setAccessToken(null);
    return null;
  }
  if (!res.ok) throw new RefreshUnavailableError(res.status);

  const session = parseSession(await res.json().catch(() => null));
  if (!session) throw new RefreshUnavailableError(res.status);

  setAccessToken(session.token);
  return session;
}

// Refresh tokens are single-use: concurrent callers must share one request.
let refreshPromise: Promise<Session | null> | null = null;

export function refreshSession(): Promise<Session | null> {
  refreshPromise ??= requestRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function logoutFromServer(): Promise<boolean> {
  try {
    const res = await fetch(`${API_ORIGIN}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Sign-in and sign-up receive the refresh cookie on the /graphql response, so credentials stay on.
const httpLink = new HttpLink({
  uri: API_BASE,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (!isUnauthenticated(error)) return;

  return new Observable((observer) => {
    let retry: { unsubscribe(): void } | undefined;

    refreshSession()
      .then((session) => {
        if (!session) {
          sessionLostListeners.forEach((listener) => listener());
          observer.error(new SessionExpiredError());
          return;
        }

        // Re-enters authLink, which reads the refreshed token. Results of the retry bypass this handler.
        retry = forward(operation).subscribe(observer);
      })
      .catch((err) => observer.error(err));

    return () => retry?.unsubscribe();
  });
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Pages replace each other; they are never merged.
          tasks: { merge: false },
          // The edit page can open straight from a task already in the cache.
          task: {
            read: (existing, { args, toReference }) =>
              existing ?? toReference({ __typename: "Task", id: args?.id }),
          },
        },
      },
    },
  }),
});

export default client;
