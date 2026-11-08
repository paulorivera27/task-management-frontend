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
  current: TaskStatus | null;
  onChange: (status: TaskStatus | null) => void;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskFormProps {
  initialValues?: Pick<Task, "title" | "description" | "status">;
  onSubmit: (values: TaskFormValues) => void;
  loading: boolean;
  error?: string | null;
}

export interface MutationPayload {
  errors: string[];
}

export interface CreateTaskData {
  createTask: MutationPayload & { task: Task | null };
}

export interface UpdateTaskData {
  updateTask: MutationPayload & { task: Task | null };
}

export interface DeleteTaskData {
  deleteTask: MutationPayload & { id: string | null };
}

export type CreateTaskVariables = TaskFormValues;

export type UpdateTaskVariables = { id: string } & Partial<TaskFormValues>;

export interface User {
  id: string;
  email: string;
}

export interface Session {
  token: string;
  user: User;
}

export interface AuthPayload {
  token: string | null;
  user: User | null;
  errors: string[];
}

export interface SignInData {
  signIn: AuthPayload;
}

export interface SignUpData {
  signUp: AuthPayload;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  loggedOut: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<boolean>;
}
