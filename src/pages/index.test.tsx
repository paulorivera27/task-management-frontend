import IndexPage from "./index";
import client from "../lib/apollo";
import { invalidateTasks } from "../lib/cache";
import { renderPage } from "../test/render";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { status, task, mockGraphql, mockRefresh, sessionBody } from "../test/api";

const location = () => screen.getByTestId("location").textContent;
const ok = (tasks: object[], totalCount = tasks.length) => ({
  data: { tasks: { tasks, totalCount, __typename: "TasksResult" } },
});
const titled = (n: number) => task({ id: String(n), title: `Task ${n}` });

describe("IndexPage", () => {
  it("lists the tasks", async () => {
    mockGraphql({ GetTasks: () => ok([titled(1), titled(2)]) });
    renderPage(<IndexPage />, { path: "/" });

    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });

  it("shows the empty state and hides the pagination for no tasks", async () => {
    mockGraphql({ GetTasks: () => ok([]) });
    renderPage(<IndexPage />, { path: "/" });

    expect(await screen.findByText("No tasks found.", { selector: "p" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("reads the page and filter from the URL", async () => {
    const calls = mockGraphql({ GetTasks: () => ok([titled(11)], 25) });
    renderPage(<IndexPage />, { path: "/", route: "/?status=PENDING&page=2" });

    await screen.findByText("Task 11");

    expect(calls[0].variables).toEqual({ limit: 10, offset: 10, status: "PENDING" });
  });

  it("ignores malformed URL parameters", async () => {
    const calls = mockGraphql({ GetTasks: () => ok([titled(1)]) });
    renderPage(<IndexPage />, { path: "/", route: "/?status=DONE&page=-3" });

    await screen.findByText("Task 1");

    expect(calls[0].variables).toEqual({ limit: 10, offset: 0 });
  });

  it("writes the page to the URL and omits page 1", async () => {
    mockGraphql({ GetTasks: ({ variables }) => ok([titled(Number(variables.offset) / 10 + 1)], 30) });
    renderPage(<IndexPage />, { path: "/" });
    await screen.findByText("Task 1");

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Task 2");
    expect(location()).toBe("/?page=2");

    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("Task 1");
    expect(location()).toBe("/");
  });

  it("filters, resets to the first page and keeps the filter in the URL", async () => {
    const calls = mockGraphql({ GetTasks: () => ok([titled(1)], 30) });
    renderPage(<IndexPage />, { path: "/", route: "/?page=3" });
    await screen.findByText("Task 1");

    await userEvent.click(screen.getByRole("button", { name: "Completed" }));

    await waitFor(() => expect(location()).toBe("/?status=COMPLETED"));
    await waitFor(() => expect(calls.at(-1)?.variables).toEqual({ limit: 10, offset: 0, status: "COMPLETED" }));
  });

  it("moves back to the last page when the requested page is past the end", async () => {
    mockGraphql({
      GetTasks: ({ variables }) => (variables.offset === 10 ? ok([titled(11)], 15) : ok([], 15)),
    });
    renderPage(<IndexPage />, { path: "/", route: "/?page=9" });

    await screen.findByText("Task 11");

    expect(location()).toBe("/?page=2");
  });

  it("keeps the previous results on screen while the next page loads", async () => {
    let release: (value: unknown) => void = () => {};
    const second = new Promise((resolve) => (release = resolve));
    mockGraphql({
      GetTasks: ({ variables }) => (variables.offset === 0 ? ok([titled(1)], 20) : second),
    });
    renderPage(<IndexPage />, { path: "/" });
    await screen.findByText("Task 1");

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    release(ok([titled(11)], 20));
    expect(await screen.findByText("Task 11")).toBeInTheDocument();
  });

  it("shows a translated error", async () => {
    mockGraphql({ GetTasks: () => status(429) });
    renderPage(<IndexPage />, { path: "/" });

    expect(await screen.findByRole("alert")).toHaveTextContent("Too many requests");
  });

  it("refreshes the list after a task is deleted and falls back a page when it was the last item", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockRefresh(() => sessionBody());
    const all = [...Array.from({ length: 10 }, (_, i) => titled(i + 1)), titled(11)];
    mockGraphql({
      GetTasks: ({ variables }) => ok(all.slice(Number(variables.offset), Number(variables.offset) + 10), all.length),
      DeleteTask: ({ variables }) => {
        all.splice(all.findIndex((t) => t.id === variables.id), 1);
        return { data: { deleteTask: { id: variables.id, errors: [] } } };
      },
    });
    renderPage(<IndexPage />, { path: "/", route: "/?page=2" });
    const card = (await screen.findByText("Task 11")).closest("div")!.parentElement!;

    await userEvent.click(within(card).getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(screen.queryByText("Task 11")).not.toBeInTheDocument());
    await waitFor(() => expect(location()).toBe("/"));
    expect(await screen.findByText("Task 10")).toBeInTheDocument();
    vi.restoreAllMocks();
  });

  it("invalidating the task lists evicts them and makes the mounted query refetch", async () => {
    const calls = mockGraphql({ GetTasks: () => ok([titled(1)]) });
    renderPage(<IndexPage />, { path: "/" });
    await screen.findByText("Task 1");
    const cachedLists = () =>
      Object.keys((client.cache.extract() as Record<string, object>).ROOT_QUERY ?? {}).filter((k) => k.startsWith("tasks"));
    expect(cachedLists()).not.toHaveLength(0);

    invalidateTasks(client.cache);

    await waitFor(() => expect(calls.length).toBeGreaterThan(1));
  });
});
