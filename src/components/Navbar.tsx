import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { ErrorText } from "./styles/taskForm";
import { Nav, UserEmail, LogoutButton } from "./styles/navbar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [logoutFailed, setLogoutFailed] = useState(false);

  const handleLogout = async () => {
    setLogoutFailed(!(await logout()));
  };

  return (
    <Nav>
      <UserEmail>{user?.email}</UserEmail>
      <LanguageSwitcher />
      <LogoutButton onClick={handleLogout}>{t("nav.logout")}</LogoutButton>
      {logoutFailed && (
        <ErrorText role="alert">{t("errors.logout_failed")}</ErrorText>
      )}
    </Nav>
  );
}
