import { useState } from "react";
import TaskList from "../components/TaskList";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import TaskFilter from "../components/TaskFilter";
import Pagination from "../components/Pagination";
import type { GetTasksData, Task } from "../types";
import { Button, FlexRowContainer } from "../components/styles/shared";
import { MainContainer, PageTitle } from "../components/styles/taskList";

export default function IndexPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | null>(null);

  const { data, loading, error } = useQuery<GetTasksData>(GET_TASKS, {
    fetchPolicy: "cache-and-network",
    variables: {
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
      ...(filter ? { status: filter } : {}),
    },
  });

  const handleFilterChange = (status: string | null) => {
    setFilter(status);
    setPage(1);
  };

  const tasks: Task[] = data?.tasks.tasks ?? [];
  const totalPages = Math.ceil((data?.tasks.totalCount ?? 0) / PER_PAGE);

  return (
    <MainContainer>
      <PageTitle>{t("home_page.title")}</PageTitle>

      <FlexRowContainer
        $alignItems="baseline"
        $justify="space-between"
        $background="transparent"
      >
        <TaskFilter current={filter} onChange={handleFilterChange} />
        <Button onClick={() => navigate("/tasks/new")}>
          {t("home_page.create_button")}
        </Button>
      </FlexRowContainer>

      <TaskList tasks={tasks} loading={loading} error={error} />

      {totalPages > 1 && (
        <Pagination
          onPageChange={setPage}
          totalPages={totalPages}
          currentPage={page}
        />
      )}
    </MainContainer>
  );
}
