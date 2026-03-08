import {
  Card,
  Actions,
  CardTitle,
  StatusBadge,
  Description,
} from "./styles/taskCard";
import { TaskStatus } from "../types";
import type { TaskItemProps } from "../types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@apollo/client/react";
import { statusTranslationKey } from "../utils/constants";
import { Button, FlexRowContainer } from "./styles/shared";
import { DELETE_TASK, UPDATE_TASK } from "../graphql/mutations";

export default function TaskCard({ task }: TaskItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteTask, { loading: deleting }] = useMutation(DELETE_TASK, {
    variables: { id: task.id },
    refetchQueries: ["GetTasks"],
    update: (cache) => {
      cache.evict({ id: cache.identify({ __typename: "Task", id: task.id }) });
      cache.gc();
    },
  });
  const [updateTaskStatus, { loading: updating }] = useMutation(UPDATE_TASK);

  const handleStatusChange = (newStatus: string) => {
    updateTaskStatus({
      variables: { id: task.id, status: newStatus },
      refetchQueries: ["GetTasks"],
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(t("task_card.delete_confirmation", { title: task.title }))
    ) {
      deleteTask();
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
          {t(statusTranslationKey[task.status]).toLocaleUpperCase()}
        </StatusBadge>
      </FlexRowContainer>

      <Description>{task.description}</Description>
      <Actions>
        <Button onClick={() => navigate(`/tasks/${task.id}/edit`)}>
          {t("task_card.edit_action")}
        </Button>

        {nextStatus && (
          <Button
            onClick={() => handleStatusChange(nextStatus)}
            disabled={updating}
          >
            {updating
              ? t("task_card.updating_message")
              : t("task_card.mark_action", {
                  status: t(
                    statusTranslationKey[nextStatus],
                  ).toLocaleLowerCase(),
                })}
          </Button>
        )}
        <Button onClick={handleDelete} disabled={deleting}>
          {deleting
            ? t("task_card.deleting_message")
            : t("task_card.delete_action")}
        </Button>
      </Actions>
    </Card>
  );
}
