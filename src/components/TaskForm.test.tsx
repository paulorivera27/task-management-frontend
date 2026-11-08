import { vi, describe, expect, it } from "vitest";
import TaskForm from "./TaskForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setup = (props: Partial<React.ComponentProps<typeof TaskForm>> = {}) => {
  const onSubmit = vi.fn();
  render(<TaskForm loading={false} onSubmit={onSubmit} {...props} />);
  return onSubmit;
};

describe("TaskForm", () => {
  it("submits the entered values", async () => {
    const onSubmit = setup();

    await userEvent.type(screen.getByPlaceholderText("Task Title"), "Ship it");
    await userEvent.type(screen.getByPlaceholderText("Task Description"), "today");
    await userEvent.selectOptions(screen.getByRole("combobox"), "COMPLETED");
    await userEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "Ship it",
      description: "today",
      status: "COMPLETED",
    });
  });

  it("defaults to a pending task", async () => {
    const onSubmit = setup();

    await userEvent.type(screen.getByPlaceholderText("Task Title"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ status: "PENDING" }));
  });

  it("does not submit a blank title", async () => {
    const onSubmit = setup();

    await userEvent.type(screen.getByPlaceholderText("Task Title"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Create Task" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is prefilled when editing", () => {
    setup({
      initialValues: { title: "Old", description: "notes", status: "IN_PROGRESS" },
    });

    expect(screen.getByPlaceholderText("Task Title")).toHaveValue("Old");
    expect(screen.getByPlaceholderText("Task Description")).toHaveValue("notes");
    expect(screen.getByRole("combobox")).toHaveValue("IN_PROGRESS");
    expect(screen.getByRole("button", { name: "Update Task" })).toBeInTheDocument();
  });

  it("disables the button while saving", () => {
    setup({ loading: true });

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("announces an error", () => {
    setup({ error: "Title can't be blank" });

    expect(screen.getByRole("alert")).toHaveTextContent("Title can't be blank");
  });
});
