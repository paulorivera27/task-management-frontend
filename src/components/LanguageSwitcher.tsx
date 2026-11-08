import { useTranslation } from "react-i18next";
import { LanguageSelect } from "./styles/navbar";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <LanguageSelect
      value={i18n.language}
      aria-label={t("language.label")}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      {LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code} lang={code}>
          {label}
        </option>
      ))}
    </LanguageSelect>
  );
}
