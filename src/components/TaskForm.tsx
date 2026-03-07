import { useState } from "react";
import {
  Input,
  Select,
  Button,
  TextArea,
  ErrorText,
  SecondaryContainer,
  FlexColumnContainer,
} from "./styles/componentStyles";
import type { Task } from "../types";
import { TaskStatus } from "../types";
import { useTranslation } from "react-i18next";

interface TaskFormProps {
  initialValues?: Pick<Task, "title" | "description" | "status">;
  onSubmit: (values: {
    title: string;
    description: string;
    status: string;
  }) => void;
  loading: boolean;
  error?: string;
}

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
  const [status, setStatus] = useState<string>(
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
          <Input
            required
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("task_form.title_placeholder")}
          />

          <TextArea
            rows={3}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("task_form.description_placeholder")}
          />

          <Select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value={TaskStatus.PENDING}>
              {t("status_filters.pending")}
            </option>
            <option value={TaskStatus.IN_PROGRESS}>
              {t("status_filters.in_progress")}
            </option>
            <option value={TaskStatus.COMPLETED}>
              {t("status_filters.completed")}
            </option>
          </Select>

          <Button type="submit" disabled={loading}>
            {loading
              ? t("task_form.saving")
              : isEditing
                ? t("task_form.update_button")
                : t("task_form.create_button")}
          </Button>

          {error && <ErrorText>{error}</ErrorText>}
        </FlexColumnContainer>
      </form>
    </SecondaryContainer>
  );
}
