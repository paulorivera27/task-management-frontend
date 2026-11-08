import { useTranslation } from "react-i18next";

export default function LoadingComponent() {
  const { t } = useTranslation();

  return <p role="status">{t("common.loading")}</p>;
}
