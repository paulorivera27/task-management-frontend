import TaskForm from "../components/TaskForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { invalidateTasks } from "../lib/cache";
import { CREATE_TASK } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import { useMutationFeedback } from "../hooks/useMutationFeedback";
import { MainContainer, PageTitle } from "../components/styles/taskList";
import type {
  TaskFormValues,
  CreateTaskData,
  CreateTaskVariables,
} from "../types";

export default function TaskCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error, run } = useMutationFeedback();

  const [createTask, { loading }] = useMutation<
    CreateTaskData,
    CreateTaskVariables
  >(CREATE_TASK, {
    update: (cache, { data }) => {
      if (!data?.createTask.errors.length) invalidateTasks(cache);
    },
  });

  const handleSubmit = async (values: TaskFormValues) => {
    const saved = await run(
      async () => (await createTask({ variables: values })).data?.createTask,
    );
    if (saved) navigate("/");
  };

  return (
    <MainContainer>
      <PageTitle>{t("tasks_create.title")}</PageTitle>
      <TaskForm loading={loading} error={error} onSubmit={handleSubmit} />
    </MainContainer>
  );
}
