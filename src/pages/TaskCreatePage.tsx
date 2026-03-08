import TaskForm from "../components/TaskForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CREATE_TASK } from "../graphql/mutations";
import { useMutation } from "@apollo/client/react";
import { MainContainer, PageTitle } from "../components/styles/componentStyles";

export default function TaskCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [createTask, { loading, error }] = useMutation(CREATE_TASK, {
    refetchQueries: ["GetTasks"],
    onCompleted: () => navigate("/"),
  });

  const handleSubmit = (values: {
    title: string;
    status: string;
    description: string;
  }) => {
    createTask({ variables: values });
  };

  return (
    <MainContainer>
      <PageTitle>{t("tasks_create.title")}</PageTitle>
      <TaskForm
        loading={loading}
        error={error?.message}
        onSubmit={handleSubmit}
      />
    </MainContainer>
  );
}
