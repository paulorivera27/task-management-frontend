import {
  PageTitle,
  MainContainer,
  NoTasksContainer,
  SecondaryContainer,
} from "./styles/componentStyles";
import { useState } from "react";
import TaskCard from "./TaskCard";
import type { Task } from "../types";
import TaskFilter from "./TaskFilter";
import { sleepyTaskImage } from "../assets";
import { useTranslation } from "react-i18next";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";

interface GetTasksData {
  tasks: Task[];
}

export default function TaskList() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string | null>(null);

  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS, {
    variables: filter ? { status: filter } : {},
  });

  const tasks: Task[] = data?.tasks ?? [];

  return (
    <MainContainer>
      <PageTitle>{t("home_page.title")}</PageTitle>
      <TaskFilter current={filter} onChange={setFilter} />

      <SecondaryContainer>
        {loading ? (
          <p>{t("tasks_list.loading_message")}</p>
        ) : error ? (
          <p>
            {t("tasks_list.error_loading_tasks", { message: error.message })}
          </p>
        ) : !tasks.length ? (
          <NoTasksContainer>
            <img src={sleepyTaskImage} alt="No tasks" width={120} />
            <p>{t("tasks_list.no_tasks_message")}</p>
          </NoTasksContainer>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </SecondaryContainer>
    </MainContainer>
  );
}
