import {
  Card,
  Actions,
  CardTitle,
  StatusBadge,
  Description,
} from "./styles/taskCard";
import { TaskStatus } from "../types";
import { ErrorText } from "./styles/taskForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client/react";
import { invalidateTasks } from "../lib/cache";
import { statusTranslationKey } from "../utils/constants";
import { Button, FlexRowContainer } from "./styles/shared";
import { DELETE_TASK, UPDATE_TASK } from "../graphql/mutations";
import { useMutationFeedback } from "../hooks/useMutationFeedback";
import type {
  TaskItemProps,
  DeleteTaskData,
  UpdateTaskData,
  UpdateTaskVariables,
} from "../types";

const markActionKey = {
  [TaskStatus.IN_PROGRESS]: "task_card.mark_in_progress",
  [TaskStatus.COMPLETED]: "task_card.mark_completed",
} as const;

export default function TaskCard({ task }: TaskItemProps) {
  const { t } = useTranslation();

  const { error, run } = useMutationFeedback();

  const [deleteTask, { loading: deleting }] = useMutation<
    DeleteTaskData,
    { id: string }
  >(DELETE_TASK, {
    update: (cache, { data }) => {
      if (data?.deleteTask.errors.length) return;
      cache.evict({ id: cache.identify({ __typename: "Task", id: task.id }) });
      invalidateTasks(cache);
    },
  });
  const [updateTaskStatus, { loading: updating }] = useMutation<
    UpdateTaskData,
    UpdateTaskVariables
  >(UPDATE_TASK, {
    update: (cache, { data }) => {
      if (!data?.updateTask.errors.length) invalidateTasks(cache);
    },
  });

  const handleStatusChange = (newStatus: TaskStatus) =>
    run(
      async () =>
        (
          await updateTaskStatus({
            variables: { id: task.id, status: newStatus },
          })
        ).data?.updateTask,
    );

  const handleDelete = () => {
    if (
      window.confirm(t("task_card.delete_confirmation", { title: task.title }))
    ) {
      void run(
        async () =>
          (await deleteTask({ variables: { id: task.id } })).data?.deleteTask,
      );
    }
  };

  const nextStatus =
    task.status === TaskStatus.PENDING
      ? TaskStatus.IN_PROGRESS
      : task.status === TaskStatus.IN_PROGRESS
        ? TaskStatus.COMPLETED
        : null;

  return (
    <Card>
      <FlexRowContainer $justify="space-between">
        <CardTitle>{task.title}</CardTitle>
        <StatusBadge $status={task.status}>
          {t(statusTranslationKey[task.status])}
        </StatusBadge>
      </FlexRowContainer>

      <Description>{task.description}</Description>
      <Actions>
        <Button as={Link} to={`/tasks/${task.id}/edit`}>
          {t("task_card.edit_action")}
        </Button>

        {nextStatus && (
          <Button
            onClick={() => handleStatusChange(nextStatus)}
            disabled={updating}
          >
            {updating
              ? t("task_card.updating_message")
              : t(markActionKey[nextStatus])}
          </Button>
        )}
        <Button onClick={handleDelete} disabled={deleting}>
          {deleting
            ? t("task_card.deleting_message")
            : t("task_card.delete_action")}
        </Button>
      </Actions>
      {error && <ErrorText role="alert">{error}</ErrorText>}
    </Card>
  );
}
