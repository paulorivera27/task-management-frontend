import { notFoundImage } from "../assets";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/styles/shared";
import { MainContainer, NoTasksContainer } from "../components/styles/taskList";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <MainContainer>
      <NoTasksContainer>
        <img src={notFoundImage} alt={t("not_found.title")} />
        <h2>{t("not_found.title")}</h2>
        <p>{t("not_found.message")}</p>
        <Button onClick={() => navigate("/")}>{t("not_found.go_home")}</Button>
      </NoTasksContainer>
    </MainContainer>
  );
}
