import i18n from "i18next";
import en from "./locales/en.json";
import ja from "./locales/ja.json";
import es from "./locales/es.json";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const SUPPORTED_LANGUAGES = ["en", "es", "ja"];

// Screen readers pick the voice from <html lang>, and the tab title follows the language.
i18n.on("languageChanged", (language) => {
  document.documentElement.lang = i18n.resolvedLanguage ?? language;
  document.title = i18n.t("app.title");
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      es: { translation: es },
    },
    fallbackLng: "en",
    // Maps regional tags such as es-ES (browser or stored value) onto the bundled language.
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
