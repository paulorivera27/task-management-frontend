import { taskStatuses } from "./constants";
import type { TaskStatus } from "../types";

export const PER_PAGE = 10;

export type PageItem = number | "gap";

export function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function parseStatus(value: string | null): TaskStatus | null {
  return taskStatuses.find((status) => status === value) ?? null;
}

// First, last and the current page with its neighbours; a skipped run collapses into one gap.
export function pageWindow(current: number, total: number): PageItem[] {
  const shown = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  return shown.flatMap((page, index): PageItem[] => {
    const skipped = index === 0 ? 0 : page - shown[index - 1] - 1;
    if (skipped === 0) return [page];
    return skipped === 1 ? [page - 1, page] : ["gap", page];
  });
}
