import { sleepyTaskImage } from "../assets";
import { useTranslation } from "react-i18next";
import { NoTasksContainer } from "./styles/componentStyles";

interface EmptyStateProps {
  isTaskList?: boolean;
}

export default function EmptyState({ isTaskList }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <NoTasksContainer>
      <img
        src={sleepyTaskImage}
        alt={
          isTaskList
            ? t("tasks_list.no_tasks_message")
            : t("tasks_edit.task_not_found")
        }
      />
      {isTaskList ? (
        <p>{t("tasks_list.no_tasks_message")}</p>
      ) : (
        <p>{t("tasks_edit.task_not_found")}</p>
      )}
    </NoTasksContainer>
  );
}
