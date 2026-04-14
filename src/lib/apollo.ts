import {
  HttpLink,
  Observable,
  ApolloLink,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { CombinedGraphQLErrors } from "@apollo/client/errors";

const API_BASE = import.meta.env.VITE_API_URL || "/graphql";
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin;

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_ORIGIN}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) {
        setAccessToken(null);
        return null;
      }
      const data = await res.json();
      setAccessToken(data.token);
      return data.token as string;
    })
    .catch(() => {
      setAccessToken(null);
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function refreshSession(): Promise<{
  token: string;
  user: { id: string; email: string };
} | null> {
  try {
    const res = await fetch(`${API_ORIGIN}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.token);
    return data;
  } catch {
    return null;
  }
}

export async function logoutFromServer(): Promise<void> {
  await fetch(`${API_ORIGIN}/auth/logout`, {
    method: "DELETE",
    credentials: "include",
  }).catch(() => {});
}

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
  if (CombinedGraphQLErrors.is(error)) {
    const authError = error.errors.some(
      (e) => e.message === "Authentication required",
    );

    if (authError) {
      return new Observable((observer) => {
        refreshAccessToken()
          .then((newToken) => {
            if (!newToken) {
              observer.error(new Error("Session expired"));
              return;
            }

            const oldHeaders = operation.getContext().headers || {};
            operation.setContext({
              headers: {
                ...oldHeaders,
                Authorization: `Bearer ${newToken}`,
              },
            });

            forward(operation).subscribe(observer);
          })
          .catch((err) => observer.error(err));
      });
    }
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          tasks: {
            keyArgs: ["status", "limit", "offset"],
            merge: false,
          },
        },
      },
    },
  }),
});

export default client;
