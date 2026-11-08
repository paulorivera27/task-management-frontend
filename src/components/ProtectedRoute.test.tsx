import { describe, expect, it } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import { Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { screen } from "@testing-library/react";
import { renderRoutes } from "../test/render";
import userEvent from "@testing-library/user-event";
import { status, mockLogout, mockRefresh, mockGraphql, sessionBody } from "../test/api";

const routes = (
  <>
    <Route path="/login" element={<p>login page</p>} />
    <Route element={<ProtectedRoute />}>
      <Route path="/tasks" element={<p>secret page</p>} />
    </Route>
  </>
);

describe("ProtectedRoute", () => {
  it("shows a loading state while the session is being restored", () => {
    mockRefresh(() => new Promise(() => {}));
    renderRoutes(routes, { route: "/tasks" });

    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
    expect(screen.queryByText("login page")).not.toBeInTheDocument();
  });

  it("renders the page and the navbar for a signed-in user", async () => {
    mockRefresh(() => sessionBody());
    renderRoutes(routes, { route: "/tasks" });

    expect(await screen.findByText("secret page")).toBeInTheDocument();
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("redirects anonymous visitors to /login", async () => {
    mockRefresh(() => status(401));
    renderRoutes(routes, { route: "/tasks" });

    expect(await screen.findByText("login page")).toBeInTheDocument();
    expect(screen.queryByText("secret page")).not.toBeInTheDocument();
  });

  it("starts the next sign-in from the home page after a deliberate logout", async () => {
    mockRefresh(() => sessionBody());
    mockLogout(() => status(204));
    mockGraphql({
      SignIn: () => ({
        data: { signIn: { token: "jwt", user: { id: "8", email: "other@example.com" }, errors: [] } },
      }),
    });
    renderRoutes(
      <>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<p>home page</p>} />
          <Route path="/tasks" element={<p>secret page</p>} />
        </Route>
      </>,
      { route: "/tasks" },
    );

    await userEvent.click(await screen.findByRole("button", { name: "Log out" }));
    await userEvent.type(await screen.findByPlaceholderText("Email"), "other@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("secret page")).not.toBeInTheDocument();
  });
});
