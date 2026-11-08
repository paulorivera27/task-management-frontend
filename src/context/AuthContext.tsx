import {
  setAccessToken,
  onSessionLost,
  refreshSession,
  logoutFromServer,
} from "../lib/apollo";
import type { User } from "../types";
import { AuthContext } from "./useAuth";
import { useApolloClient } from "@apollo/client/react";
import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // A transient failure leaves the user signed out rather than blocking the app.
    refreshSession()
      .then((session) => {
        if (!cancelled && session) setUser(session.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () =>
      onSessionLost(() => {
        setUser(null);
        setSessionExpired(true);
        void client.clearStore();
      }),
    [client],
  );

  const login = useCallback((token: string, newUser: User) => {
    setAccessToken(token);
    setSessionExpired(false);
    setLoggedOut(false);
    setUser(newUser);
  }, []);

  // Local state is kept when the server could not revoke the session: the cookie would restore it on reload.
  const logout = useCallback(async () => {
    const revoked = await logoutFromServer();
    if (!revoked) return false;

    setAccessToken(null);
    setLoggedOut(true);
    setUser(null);
    await client.clearStore();
    return true;
  }, [client]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      loggedOut,
      sessionExpired,
      loading: !ready,
      isAuthenticated: !!user,
    }),
    [user, ready, login, logout, loggedOut, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
