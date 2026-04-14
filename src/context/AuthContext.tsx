import {
  setAccessToken,
  refreshSession,
  logoutFromServer,
} from "../lib/apollo";
import type { User } from "../types";
import { AuthContext } from "./useAuth";
import { useApolloClient } from "@apollo/client/react";
import { useState, useEffect, useCallback, type ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refreshSession()
      .then((session) => {
        if (!cancelled && session) {
          setUser(session.user);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((token: string, newUser: User) => {
    setAccessToken(token);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutFromServer();
    setAccessToken(null);
    setUser(null);
    client.resetStore();
  }, [client]);

  return (
    <AuthContext.Provider
      value={{ user, loading: !ready, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
