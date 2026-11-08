import TaskList from "../components/TaskList";
import { useTranslation } from "react-i18next";
import { GET_TASKS } from "../graphql/queries";
import { useQuery } from "@apollo/client/react";
import TaskFilter from "../components/TaskFilter";
import Pagination from "../components/Pagination";
import { useCallback, useEffect } from "react";
import type { GetTasksData, TaskStatus } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { Button, FlexRowContainer } from "../components/styles/shared";
import { MainContainer, PageTitle } from "../components/styles/taskList";
import { PER_PAGE, parsePage, parseStatus } from "../utils/pagination";

export default function IndexPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const page = parsePage(params.get("page"));
  const filter = parseStatus(params.get("status"));

  const { data, previousData, loading, error } = useQuery<GetTasksData>(
    GET_TASKS,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        limit: PER_PAGE,
        offset: (page - 1) * PER_PAGE,
        ...(filter ? { status: filter } : {}),
      },
    },
  );

  // Keep the previous results on screen while the next ones load.
  const result = data ?? previousData;
  const tasks = result?.tasks.tasks ?? [];
  const totalCount = result?.tasks.totalCount ?? 0;
  const lastPage = Math.max(Math.ceil(totalCount / PER_PAGE), 1);

  const updateParams = useCallback(
    (changes: Record<string, string | null>, replace = false) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace },
      ),
    [setParams],
  );

  const pageParam = (value: number) => (value > 1 ? String(value) : null);

  // A deleted last item (or a stale link) can leave the page past the end.
  useEffect(() => {
    if (data && page > lastPage) {
      updateParams({ page: pageParam(lastPage) }, true);
    }
  }, [data, page, lastPage, updateParams]);

  const handleFilterChange = (status: TaskStatus | null) =>
    updateParams({ status, page: null });

  return (
    <MainContainer>
      <PageTitle>{t("home_page.title")}</PageTitle>

      <FlexRowContainer
        $alignItems="baseline"
        $justify="space-between"
        $background="transparent"
      >
        <TaskFilter current={filter} onChange={handleFilterChange} />
        <Button as={Link} to="/tasks/new">
          {t("home_page.create_button")}
        </Button>
      </FlexRowContainer>

      <TaskList tasks={tasks} error={error} loading={loading && !result} />

      {lastPage > 1 && (
        <Pagination
          currentPage={page}
          totalPages={lastPage}
          onPageChange={(next) => updateParams({ page: pageParam(next) })}
        />
      )}
    </MainContainer>
  );
}
