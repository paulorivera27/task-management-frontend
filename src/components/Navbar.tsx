import { useAuth } from "../context/useAuth";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { Nav, UserEmail, LogoutButton } from "./styles/navbar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Nav>
      <UserEmail>{user?.email}</UserEmail>
      <LanguageSwitcher />
      <LogoutButton onClick={handleLogout}>{t("nav.logout")}</LogoutButton>
    </Nav>
  );
}
