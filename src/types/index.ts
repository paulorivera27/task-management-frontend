export const TaskStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPage {
  tasks: Task[];
  totalCount: number;
}

export interface GetTasksData {
  tasks: TaskPage;
}

export interface GetTaskData {
  task: Task;
}

export interface EmptyStateProps {
  isTaskList?: boolean;
}

export interface TaskItemProps {
  task: Task;
}

export interface TaskFilterProps {
  current: string | null;
  onChange: (status: string | null) => void;
}

export interface TaskFormProps {
  initialValues?: Pick<Task, "title" | "description" | "status">;
  onSubmit: (values: {
    title: string;
    description: string;
    status: string;
  }) => void;
  loading: boolean;
  error?: string;
}
