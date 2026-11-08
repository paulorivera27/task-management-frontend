import { Link } from "react-router-dom";
import { notFoundImage } from "../assets";
import { useTranslation } from "react-i18next";
import { Button } from "../components/styles/shared";
import { MainContainer, NoTasksContainer } from "../components/styles/taskList";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <MainContainer>
      <NoTasksContainer>
        <img src={notFoundImage} alt="" />
        <h1>{t("not_found.title")}</h1>
        <p>{t("not_found.message")}</p>
        <Button as={Link} to="/">
          {t("not_found.go_home")}
        </Button>
      </NoTasksContainer>
    </MainContainer>
  );
}
