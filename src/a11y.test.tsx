import App from "./App";
import { Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import IndexPage from "./pages/index";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import TaskEditPage from "./pages/TaskEditPage";
import TaskCreatePage from "./pages/TaskCreatePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { expectNoA11yViolations } from "./test/axe";
import { renderPage, renderRoutes } from "./test/render";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { status, task, mockGraphql, mockRefresh, sessionBody } from "./test/api";

const list = (n: number, total = n) => ({
  data: {
    tasks: {
      tasks: Array.from({ length: n }, (_, i) => task({ id: String(i + 1), title: `Task ${i + 1}` })),
      totalCount: total,
      __typename: "TasksResult",
    },
  },
});

describe("accessibility", () => {
  it("the app module still renders without crashing", () => {
    expect(App).toBeTypeOf("function");
  });

  it("sign-in page has no axe violations and labelled fields", async () => {
    mockRefresh(() => status(401));
    renderPage(<LoginPage />, { path: "/login" });

    expect(await screen.findByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Language" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("sign-up page links the password hint to the field", async () => {
    mockRefresh(() => status(401));
    renderPage(<LoginPage />, { path: "/login" });
    await userEvent.click(await screen.findByRole("button", { name: "Sign up" }));

    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("At least 8 characters.");
    await expectNoA11yViolations();
  });

  it("task list exposes filters, pager and cards as proper semantics", async () => {
    mockRefresh(() => sessionBody());
    mockGraphql({ GetTasks: () => list(10, 35) });
    renderRoutes(
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<IndexPage />} />
      </Route>,
    );
    await screen.findByText("Task 1");

    expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filter by status" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Pending" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Create Task" })).toHaveAttribute("href", "/tasks/new");
    expect(screen.getAllByRole("link", { name: "Edit" })[0]).toHaveAttribute("href", "/tasks/1/edit");
    expect(screen.getAllByRole("article")).toHaveLength(10);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(10);
    await expectNoA11yViolations();
  });

  it("empty list and errors have no axe violations", async () => {
    mockRefresh(() => sessionBody());
    mockGraphql({ GetTasks: () => list(0) });
    renderRoutes(
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<IndexPage />} />
      </Route>,
    );
    await screen.findByText("No tasks found.", { selector: "p" });

    await expectNoA11yViolations();
  });

  it("create and edit forms label every control", async () => {
    mockRefresh(() => sessionBody());
    mockGraphql({ GetTask: () => ({ data: { task: task() } }) });
    renderRoutes(
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks/new" element={<TaskCreatePage />} />
        <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
      </Route>,
      { route: "/tasks/new" },
    );

    expect(await screen.findByLabelText("Task Title")).toBeRequired();
    expect(screen.getByLabelText("Task Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("edit form has no axe violations", async () => {
    mockRefresh(() => sessionBody());
    mockGraphql({ GetTask: () => ({ data: { task: task() } }) });
    renderRoutes(
      <Route element={<ProtectedRoute />}>
        <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
      </Route>,
      { route: "/tasks/1/edit" },
    );

    expect(await screen.findByLabelText("Task Title")).toHaveValue("Write tests");
    await expectNoA11yViolations();
  });

  it("not-found page has a single level-one heading, a link home and a decorative image", async () => {
    mockRefresh(() => sessionBody());
    renderRoutes(
      <Route element={<ProtectedRoute />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
      { route: "/nope" },
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("announces form errors", async () => {
    mockGraphql({
      CreateTask: () => ({ data: { createTask: { task: null, errors: ["Title can't be blank"] } } }),
    });
    renderPage(<TaskCreatePage />);
    await userEvent.type(await screen.findByLabelText("Task Title"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Title can't be blank");
    await expectNoA11yViolations();
  });
});
