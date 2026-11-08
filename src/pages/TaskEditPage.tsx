import TaskForm from "../components/TaskForm";
import { GET_TASK } from "../graphql/queries";
import { useTranslation } from "react-i18next";
import EmptyState from "../components/EmptyState";
import { UPDATE_TASK } from "../graphql/mutations";
import { ErrorText } from "../components/styles/taskForm";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client/react";
import LoadingComponent from "../components/LoadingComponent";
import { useMutationFeedback } from "../hooks/useMutationFeedback";
import { MainContainer, PageTitle } from "../components/styles/taskList";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { errorMessageKey, isUnauthenticated } from "../lib/errors";
import type {
  GetTaskData,
  TaskFormValues,
  UpdateTaskData,
  UpdateTaskVariables,
} from "../types";

export default function TaskEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { error, run } = useMutationFeedback();

  const {
    data,
    error: fetchError,
    loading: fetching,
  } = useQuery<GetTaskData>(GET_TASK, { variables: { id } });

  const [updateTask, { loading: updating }] = useMutation<
    UpdateTaskData,
    UpdateTaskVariables
  >(UPDATE_TASK, {
    refetchQueries: ({ data }) =>
      data?.updateTask.errors.length ? [] : ["GetTasks"],
  });

  const handleSubmit = async (values: TaskFormValues) => {
    const saved = await run(
      async () =>
        (await updateTask({ variables: { id, ...values } })).data?.updateTask,
    );
    if (saved) navigate("/");
  };

  // The API reports a missing or foreign task as a plain GraphQL error.
  const notFound =
    CombinedGraphQLErrors.is(fetchError) && !isUnauthenticated(fetchError);

  return (
    <MainContainer>
      <PageTitle>{t("tasks_edit.title")}</PageTitle>

      {fetching ? (
        <LoadingComponent />
      ) : fetchError && !notFound ? (
        <ErrorText role="alert">{t(errorMessageKey(fetchError))}</ErrorText>
      ) : !data?.task ? (
        <EmptyState />
      ) : (
        <TaskForm
          error={error}
          loading={updating}
          onSubmit={handleSubmit}
          initialValues={data.task}
        />
      )}
    </MainContainer>
  );
}
