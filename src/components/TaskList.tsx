import TaskCard from "./TaskCard";
import type { Task } from "../types";
import { sleepyTaskImage } from "../assets";
import { useTranslation } from "react-i18next";
import { NoTasksContainer, SecondaryContainer } from "./styles/componentStyles";

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
        <p>{t("tasks_list.loading_message")}</p>
      ) : error ? (
        <p>{t("tasks_list.error_loading_tasks", { message: error.message })}</p>
      ) : !tasks.length ? (
        <NoTasksContainer>
          <img src={sleepyTaskImage} alt="No tasks" width={120} />
          <p>{t("tasks_list.no_tasks_message")}</p>
        </NoTasksContainer>
      ) : (
        tasks.map((task) => <TaskCard key={task.id} task={task} />)
      )}
    </SecondaryContainer>
  );
}
