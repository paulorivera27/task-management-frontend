import TaskCard from "./TaskCard";
import type { Task } from "../types";
import EmptyState from "./EmptyState";
import LoadingComponent from "./LoadingComponent";
import { errorMessageKey } from "../lib/errors";
import { useTranslation } from "react-i18next";
import { SecondaryContainer } from "./styles/taskList";

function errorText(error: Error) {
  const key = errorMessageKey(error);
  return key === "errors.generic" ? "tasks_list.error_loading_tasks" : key;
}

export default function TaskList({
  tasks,
  loading,
  error,
}: {
  tasks: Task[];
  loading: boolean;
  error?: Error;
}) {
  const { t } = useTranslation();

  return (
    <SecondaryContainer>
      {loading ? (
        <LoadingComponent />
      ) : error ? (
        <p role="alert">{t(errorText(error))}</p>
      ) : !tasks.length ? (
        <EmptyState isTaskList={true} />
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </SecondaryContainer>
  );
}
