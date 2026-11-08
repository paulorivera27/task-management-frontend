import { TaskStatus } from "./types";

export const statusColors: Record<TaskStatus, { color: string; background: string }> = {
  [TaskStatus.PENDING]: { color: "#383d41", background: "#e2e3e5" },
  [TaskStatus.IN_PROGRESS]: { color: "#856404", background: "#fff3cd" },
  [TaskStatus.COMPLETED]: { color: "#155724", background: "#d4edda" },
};
