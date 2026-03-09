import { AuthContext } from "./useAuth";
import { CURRENT_USER } from "../graphql/queries";
import type { User, CurrentUserData } from "../types";
import { useApolloClient } from "@apollo/client/react";
import { useState, useEffect, useCallback, type ReactNode } from "react";

const hasToken = () => !!localStorage.getItem("token");

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!hasToken());

  useEffect(() => {
    if (!hasToken()) return;

    let cancelled = false;

    client
      .query<CurrentUserData>({
        query: CURRENT_USER,
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        if (!cancelled) setUser(data?.currentUser ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("token");
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [client]);

  const login = useCallback((token: string, newUser: User) => {
    localStorage.setItem("token", token);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
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
