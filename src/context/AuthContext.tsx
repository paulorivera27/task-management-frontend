import {
  useState,
  useEffect,
  useContext,
  createContext,
  type ReactNode,
} from "react";
import { CURRENT_USER } from "../graphql/queries";
import { useApolloClient } from "@apollo/client/react";
import type { User, CurrentUserData, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    client
      .query<CurrentUserData>({
        query: CURRENT_USER,
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        setUser(data?.currentUser ?? null);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [client]);

  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    client.resetStore();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
