import { useState } from "react";
import type { Task } from "../types";
import TaskList from "../components/TaskList";
import { useTranslation } from "react-i18next";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import TaskFilter from "../components/TaskFilter";
import { PageTitle, MainContainer } from "../components/styles/componentStyles";

interface GetTasksData {
  tasks: Task[];
}

export default function IndexPage() {
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

      <TaskList tasks={tasks} loading={loading} error={error} />
    </MainContainer>
  );
}
