import { useTranslation } from "react-i18next";

export default function LoadingComponent() {
  const { t } = useTranslation();

  return <p>{t("tasks_list.loading_message")}</p>;
}
