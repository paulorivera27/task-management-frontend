import { Route } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TaskEditPage from "./TaskEditPage";
import TaskCreatePage from "./TaskCreatePage";
import userEvent from "@testing-library/user-event";
import { renderPage, renderRoutes } from "../test/render";
import { screen, waitFor } from "@testing-library/react";
import { status, task, mockGraphql, mockRefresh, sessionBody } from "../test/api";

const location = () => screen.getByTestId("location").textContent;
const taskPayload = (key: "createTask" | "updateTask", errors: string[] = []) => ({
  data: { [key]: { task: errors.length ? null : task(), errors } },
});

async function fillCreateForm(title: string) {
  await userEvent.type(await screen.findByPlaceholderText("Task Title"), title);
  await userEvent.click(screen.getByRole("button", { name: "Create Task" }));
}

describe("TaskCreatePage", () => {
  it("creates the task and returns home", async () => {
    mockRefresh(() => sessionBody());
    const calls = mockGraphql({ CreateTask: () => taskPayload("createTask") });
    renderPage(<TaskCreatePage />);

    await fillCreateForm("Plan");

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(calls[0].variables).toMatchObject({ title: "Plan", status: "PENDING" });
  });

  it("stays on the form and shows the API's validation errors", async () => {
    mockGraphql({ CreateTask: () => taskPayload("createTask", ["Title can't be blank"]) });
    renderPage(<TaskCreatePage />);

    await fillCreateForm("Plan");

    expect(await screen.findByRole("alert")).toHaveTextContent("Title can't be blank");
    expect(location()).toBe("/page");
  });

  it("shows a translated message when the request is rejected", async () => {
    mockGraphql({ CreateTask: () => status(429) });
    renderPage(<TaskCreatePage />);

    await fillCreateForm("Plan");

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
    expect(location()).toBe("/page");
  });

  it("clears the previous error when the user retries successfully", async () => {
    let attempt = 0;
    mockGraphql({
      CreateTask: () =>
        attempt++ === 0 ? taskPayload("createTask", ["Title can't be blank"]) : taskPayload("createTask"),
    });
    renderPage(<TaskCreatePage />);

    await fillCreateForm("Plan");
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(await screen.findByText("home page")).toBeInTheDocument();
  });
});

const editRoutes = (
  <>
    <Route path="/tasks/:id/edit" element={<TaskEditPage />} />
    <Route path="/" element={<p>home page</p>} />
  </>
);

describe("TaskEditPage", () => {
  it("loads the task into the form and saves changes", async () => {
    const calls = mockGraphql({
      GetTask: () => ({ data: { task: task({ title: "Original" }) } }),
      UpdateTask: () => taskPayload("updateTask"),
    });
    renderRoutes(editRoutes, { route: "/tasks/1/edit" });

    const title = await screen.findByDisplayValue("Original");
    await userEvent.clear(title);
    await userEvent.type(title, "Renamed");
    await userEvent.click(screen.getByRole("button", { name: "Update Task" }));

    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(calls.find((c) => c.operationName === "UpdateTask")?.variables).toMatchObject({
      id: "1",
      title: "Renamed",
    });
  });

  it("keeps the form and shows the error when the update is rejected", async () => {
    mockGraphql({
      GetTask: () => ({ data: { task: task() } }),
      UpdateTask: () => taskPayload("updateTask", ["Title can't be blank"]),
    });
    renderRoutes(editRoutes, { route: "/tasks/1/edit" });

    await screen.findByDisplayValue("Write tests");
    await userEvent.click(screen.getByRole("button", { name: "Update Task" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Title can't be blank");
    expect(location()).toBe("/tasks/1/edit");
  });

  it("says the task was not found when the API reports it", async () => {
    mockGraphql({
      GetTask: () => ({ data: null, errors: [{ message: "Task with ID 9 not found." }] }),
    });
    renderRoutes(editRoutes, { route: "/tasks/9/edit" });

    expect(await screen.findAllByText("Task not found.")).not.toHaveLength(0);
  });

  it("does not call a network failure 'not found'", async () => {
    mockGraphql({ GetTask: () => Response.error() });
    renderRoutes(editRoutes, { route: "/tasks/1/edit" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server");
    await waitFor(() => expect(screen.queryByText("Task not found.")).not.toBeInTheDocument());
  });
});
