import LoginPage from "./LoginPage";
import { Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "../test/render";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import {
  status,
  mockRefresh,
  mockGraphql,
  sessionBody,
} from "../test/api";

const authPayload = (key: "signIn" | "signUp", overrides = {}) => ({
  data: {
    [key]: {
      token: "jwt",
      user: { id: "7", email: "user@example.com" },
      errors: [],
      ...overrides,
    },
  },
});

const routes = (
  <>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/tasks/:id/edit" element={<p>edit page</p>} />
    <Route path="/" element={<p>home page</p>} />
  </>
);

const location = () => screen.getByTestId("location").textContent;

async function renderSignedOut(route: Parameters<typeof renderRoutes>[1] = {}) {
  mockRefresh(() => status(401));
  renderRoutes(routes, { route: "/login", ...route });
  await screen.findByPlaceholderText("Email");
}

async function fillAndSubmit(button: string, password = "password123") {
  await userEvent.type(screen.getByPlaceholderText("Email"), "user@example.com");
  await userEvent.type(screen.getByPlaceholderText("Password"), password);
  await userEvent.click(screen.getByRole("button", { name: button }));
}

describe("LoginPage", () => {
  it("does not flash the form while the session is being restored", () => {
    mockRefresh(() => new Promise(() => {}));
    renderRoutes(routes, { route: "/login" });

    expect(screen.queryByPlaceholderText("Email")).not.toBeInTheDocument();
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("sends an already signed-in user to the home page", async () => {
    mockRefresh(() => sessionBody());
    renderRoutes(routes, { route: "/login" });

    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("signs in and goes home", async () => {
    await renderSignedOut();
    const calls = mockGraphql({ SignIn: () => authPayload("signIn") });

    await fillAndSubmit("Sign In");

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(calls[0].variables).toEqual({ email: "user@example.com", password: "password123" });
  });

  it("returns to the route the user was sent away from", async () => {
    await renderSignedOut({
      route: {
        pathname: "/login",
        state: { from: { pathname: "/tasks/9/edit", search: "?x=1", hash: "" } },
      },
    });
    mockGraphql({ SignIn: () => authPayload("signIn") });

    await fillAndSubmit("Sign In");

    expect(await screen.findByText("edit page")).toBeInTheDocument();
    expect(location()).toBe("/tasks/9/edit?x=1");
  });

  it("ignores a redirect target that is not a local path", async () => {
    await renderSignedOut({
      route: {
        pathname: "/login",
        state: { from: { pathname: "//evil.example", search: "", hash: "" } },
      },
    });
    mockGraphql({ SignIn: () => authPayload("signIn") });

    await fillAndSubmit("Sign In");

    expect(await screen.findByText("home page")).toBeInTheDocument();
  });

  it("shows the API's credential error and stays on the form", async () => {
    await renderSignedOut();
    mockGraphql({
      SignIn: () => authPayload("signIn", { token: null, user: null, errors: ["Invalid email or password."] }),
    });

    await fillAndSubmit("Sign In");

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(location()).toBe("/login");
  });

  it("translates transport failures", async () => {
    await renderSignedOut();
    mockGraphql({ SignIn: () => status(429) });

    await fillAndSubmit("Sign In");

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
  });

  it("switches to sign-up with a password hint and minimum length", async () => {
    await renderSignedOut();
    const password = screen.getByPlaceholderText("Password");
    expect(password).not.toHaveAttribute("minlength");

    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByText("At least 8 characters.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("minlength", "8");
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("autocomplete", "new-password");
  });

  it("signs up and shows validation errors from the API", async () => {
    await renderSignedOut();
    await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
    mockGraphql({
      SignUp: () => authPayload("signUp", { token: null, user: null, errors: ["Email has already been taken"] }),
    });

    await fillAndSubmit("Sign Up");

    expect(await screen.findByRole("alert")).toHaveTextContent("Email has already been taken");
    await waitFor(() => expect(location()).toBe("/login"));
  });
});
