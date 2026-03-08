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

export interface User {
  id: string;
  email: string;
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

export interface CurrentUserData {
  currentUser: User;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}
