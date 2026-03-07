import { TaskStatus } from "../types";

export const filters: { label: string; value: string | null }[] = [
  { label: "status_filters.all", value: null },
  { label: "status_filters.pending", value: TaskStatus.PENDING },
  { label: "status_filters.completed", value: TaskStatus.COMPLETED },
  { label: "status_filters.in_progress", value: TaskStatus.IN_PROGRESS },
];

export const statusTranslationKey: Record<string, string> = {
  [TaskStatus.PENDING]: "status_filters.pending",
  [TaskStatus.IN_PROGRESS]: "status_filters.in_progress",
  [TaskStatus.COMPLETED]: "status_filters.completed",
};
