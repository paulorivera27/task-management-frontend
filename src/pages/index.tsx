import { useState } from "react";
import type { Task } from "../types";
import TaskList from "../components/TaskList";
import {
  Button,
  PageTitle,
  MainContainer,
  FlexRowContainer,
} from "../components/styles/componentStyles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import TaskFilter from "../components/TaskFilter";

interface GetTasksData {
  tasks: Task[];
}

export default function IndexPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);

  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS, {
    variables: filter ? { status: filter } : {},
  });

  const tasks: Task[] = data?.tasks ?? [];

  return (
    <MainContainer>
      <PageTitle>{t("home_page.title")}</PageTitle>

      <FlexRowContainer
        $alignItems="baseline"
        $justify="space-between"
        $background="transparent"
      >
        <TaskFilter current={filter} onChange={setFilter} />
        <Button onClick={() => navigate("/tasks/new")}>
          {t("home_page.create_button")}
        </Button>
      </FlexRowContainer>

      <TaskList tasks={tasks} loading={loading} error={error} />
    </MainContainer>
  );
}
