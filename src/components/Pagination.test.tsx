import { vi, describe, expect, it } from "vitest";
import Pagination from "./Pagination";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setup = (currentPage: number, totalPages: number) => {
  const onPageChange = vi.fn();
  render(<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />);
  return onPageChange;
};

describe("Pagination", () => {
  it("disables Previous on the first page and Next on the last", () => {
    setup(1, 3);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    setup(3, 3);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeEnabled();
  });

  it("moves relative to the current page", async () => {
    const onPageChange = setup(2, 5);

    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
  });

  it("jumps to a numbered page", async () => {
    const onPageChange = setup(1, 4);

    await userEvent.click(screen.getByRole("button", { name: "3" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders a bounded number of buttons for many pages", () => {
    setup(50, 100);

    expect(screen.getAllByRole("button").length).toBeLessThanOrEqual(9);
    expect(screen.getByRole("button", { name: "100" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "50" })).toBeInTheDocument();
  });
});
