import TaskCard from "./TaskCard";
import { vi, describe, expect, it, afterEach } from "vitest";
import { renderPage } from "../test/render";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { status, task, mockGraphql } from "../test/api";
import type { Task } from "../types";

const asTask = (overrides = {}) => task(overrides) as unknown as Task;
const updated = (errors: string[] = []) => ({
  data: { updateTask: { task: errors.length ? null : task({ status: "IN_PROGRESS" }), errors } },
});

afterEach(() => vi.restoreAllMocks());

describe("TaskCard", () => {
  it("advances the status", async () => {
    const calls = mockGraphql({ UpdateTask: () => updated(), GetTasks: () => ({ data: { tasks: { tasks: [], totalCount: 0 } } }) });
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Mark as in progress" }));

    await waitFor(() => expect(calls[0]).toMatchObject({ operationName: "UpdateTask", variables: { id: "1", status: "IN_PROGRESS" } }));
  });

  it("offers no further step for a completed task", () => {
    renderPage(<TaskCard task={asTask({ status: "COMPLETED" })} />);

    expect(screen.queryByRole("button", { name: /Mark as/ })).not.toBeInTheDocument();
  });

  it("shows the API's error on the card", async () => {
    mockGraphql({ UpdateTask: () => updated(["Status is invalid"]) });
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Mark as in progress" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Status is invalid");
  });

  it("does nothing when the delete confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const calls = mockGraphql({});
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalledWith("Delete Write tests?");
    expect(calls).toHaveLength(0);
  });

  it("deletes after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const calls = mockGraphql({ DeleteTask: () => ({ data: { deleteTask: { id: "1", errors: [] } } }), GetTasks: () => ({ data: { tasks: { tasks: [], totalCount: 0 } } }) });
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(calls[0]).toMatchObject({ operationName: "DeleteTask", variables: { id: "1" } }));
  });

  it("reports a failed delete and keeps the card", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockGraphql({ DeleteTask: () => ({ data: { deleteTask: { id: null, errors: ["Task with ID 1 not found."] } } }) });
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("That task no longer exists.");
    expect(screen.getByText("Write tests")).toBeInTheDocument();
  });

  it("reports a rejected request", async () => {
    mockGraphql({ UpdateTask: () => status(500) });
    renderPage(<TaskCard task={asTask()} />);

    await userEvent.click(screen.getByRole("button", { name: "Mark as in progress" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The server had a problem");
  });
});
