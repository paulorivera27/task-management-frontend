import client from "../lib/apollo";
import { StrictMode, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ApolloProvider } from "@apollo/client/react";
import {
  Route,
  Routes,
  useLocation,
  MemoryRouter,
  type InitialEntry,
} from "react-router-dom";

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{`${pathname}${search}`}</output>;
}

interface Options {
  strict?: boolean;
  route?: InitialEntry;
}

export function renderRoutes(
  routes: ReactNode,
  { route = "/", strict = false }: Options = {},
) {
  const tree = (
    <ApolloProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>{routes}</Routes>
          <LocationProbe />
        </MemoryRouter>
      </AuthProvider>
    </ApolloProvider>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

// Renders `ui` at `path`, with a placeholder page at "/" to land on after navigation.
export function renderPage(
  ui: ReactNode,
  { path = "/page", ...options }: Options & { path?: string } = {},
) {
  return renderRoutes(
    <>
      <Route path={path} element={ui} />
      <Route path="/" element={<p>home page</p>} />
    </>,
    { route: path, ...options },
  );
}
