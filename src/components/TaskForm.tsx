import {
  ErrorText,
  FlexColumnContainer,
  Input,
  Select,
  TextArea,
} from "./styles/taskForm";
import { useState } from "react";
import { TaskStatus } from "../types";
import { Button, VisuallyHiddenLabel } from "./styles/shared";
import type { TaskFormProps } from "../types";
import { taskStatuses, statusTranslationKey } from "../utils/constants";
import { useTranslation } from "react-i18next";
import { SecondaryContainer } from "./styles/taskList";

export default function TaskForm({
  error,
  loading,
  onSubmit,
  initialValues,
}: TaskFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialValues?.status ?? TaskStatus.PENDING,
  );

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, description, status });
  };

  const isEditing = Boolean(initialValues);

  return (
    <SecondaryContainer>
      <form onSubmit={handleSubmit}>
        <FlexColumnContainer $align="normal">
          <VisuallyHiddenLabel htmlFor="title">
            {t("task_form.title_placeholder")}
          </VisuallyHiddenLabel>
          <Input
            required
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("task_form.title_placeholder")}
          />

          <VisuallyHiddenLabel htmlFor="description">
            {t("task_form.description_placeholder")}
          </VisuallyHiddenLabel>
          <TextArea
            rows={3}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("task_form.description_placeholder")}
          />

          <VisuallyHiddenLabel htmlFor="status">
            {t("task_form.status_label")}
          </VisuallyHiddenLabel>
          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {taskStatuses.map((value) => (
              <option key={value} value={value}>
                {t(statusTranslationKey[value])}
              </option>
            ))}
          </Select>

          <Button type="submit" disabled={loading}>
            {loading
              ? t("task_form.saving")
              : isEditing
                ? t("task_form.update_button")
                : t("task_form.create_button")}
          </Button>

          {error && <ErrorText role="alert">{error}</ErrorText>}
        </FlexColumnContainer>
      </form>
    </SecondaryContainer>
  );
}
