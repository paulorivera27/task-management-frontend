import type { Task } from "../types";
import { useTranslation } from "react-i18next";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";

interface GetTasksData {
  tasks: Task[];
}

export default function TaskList() {
  const { t } = useTranslation();

  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS);

  const tasks: Task[] = data?.tasks ?? [];

  return (
    <div className="task-list">
      <h2>{t("home_page.title")}</h2>

      {loading ? (
        <p>{t("tasks_list.loading_message")}</p>
      ) : error ? (
        <p>{t("tasks_list.error_loading_tasks", { message: error.message })}</p>
      ) : (
        <ul>
          {tasks.map((task: Task) => (
            <li key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Status: {task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
