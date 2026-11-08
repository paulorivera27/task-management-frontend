import App from "./App";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { status, task, mockGraphql, mockRefresh, sessionBody } from "./test/api";

const open = (path: string) => window.history.pushState({}, "", path);

afterEach(() => open("/"));

describe("App routing with lazy pages", () => {
  it("sends an anonymous visitor to the lazily loaded sign-in page", async () => {
    mockRefresh(() => status(401));
    open("/tasks/new");
    render(<App />);

    expect(await screen.findByPlaceholderText("Email")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/login");
  });

  it("loads the task list for a signed-in user", async () => {
    mockRefresh(() => sessionBody());
    mockGraphql({
      GetTasks: () => ({ data: { tasks: { tasks: [task()], totalCount: 1, __typename: "TasksResult" } } }),
    });
    open("/");
    render(<App />);

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
  });

  it("shows the not-found page for unknown routes", async () => {
    mockRefresh(() => sessionBody());
    open("/definitely/not/a/page");
    render(<App />);

    expect(await screen.findByRole("heading", { level: 1, name: "Page Not Found" })).toBeInTheDocument();
  });

  it("opens the create page directly", async () => {
    mockRefresh(() => sessionBody());
    open("/tasks/new");
    render(<App />);

    expect(await screen.findByLabelText("Task Title")).toBeInTheDocument();
  });
});
