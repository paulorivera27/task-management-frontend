import type { Task } from "../types";
import TaskForm from "../components/TaskForm";
import { useTranslation } from "react-i18next";
import EmptyState from "../components/EmptyState";
import { UPDATE_TASK } from "../graphql/mutations";
import { GET_TASK, GET_TASKS } from "../graphql/queries";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import LoadingComponent from "../components/LoadingComponent";
import { PageTitle, MainContainer } from "../components/styles/componentStyles";

interface GetTaskData {
  task: Task;
}

export default function TaskEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, loading: fetching } = useQuery<GetTaskData>(GET_TASK, {
    variables: { id },
  });

  const [updateTask, { loading: updating, error }] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query: GET_TASKS }],
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
