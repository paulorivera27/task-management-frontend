import type { GetTaskData } from "../types";
import TaskForm from "../components/TaskForm";
import { GET_TASK } from "../graphql/queries";
import { useTranslation } from "react-i18next";
import EmptyState from "../components/EmptyState";
import { UPDATE_TASK } from "../graphql/mutations";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import LoadingComponent from "../components/LoadingComponent";
import { MainContainer, PageTitle } from "../components/styles/taskList";

export default function TaskEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, loading: fetching } = useQuery<GetTaskData>(GET_TASK, {
    variables: { id },
  });

  const [updateTask, { loading: updating, error }] = useMutation(UPDATE_TASK, {
    refetchQueries: ["GetTasks"],
    onCompleted: () => navigate("/"),
  });

  const handleSubmit = (values: {
    title: string;
    status: string;
    description: string;
  }) => {
    updateTask({ variables: { id, ...values } });
  };

  return (
    <MainContainer>
      <PageTitle>{t("tasks_edit.title")}</PageTitle>

      {fetching ? (
        <LoadingComponent />
      ) : !data?.task ? (
        <EmptyState />
      ) : (
        <TaskForm
          loading={updating}
          error={error?.message}
          onSubmit={handleSubmit}
          initialValues={data.task}
        />
      )}
    </MainContainer>
  );
}
