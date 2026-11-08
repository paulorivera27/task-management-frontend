import en from "./locales/en.json";
import es from "./locales/es.json";
import ja from "./locales/ja.json";
import i18n from "i18next";
import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { renderPage } from "../test/render";
import TaskCard from "../components/TaskCard";
import { task } from "../test/api";
import type { Task } from "../types";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

const placeholders = (value: string) => (value.match(/{{\s*\w+\s*}}/g) ?? []).sort();
const locales = { en: flatten(en), es: flatten(es), ja: flatten(ja) };

describe("locale files", () => {
  it.each(["es", "ja"] as const)("%s has exactly the keys of en", (lang) => {
    expect(Object.keys(locales[lang]).sort()).toEqual(Object.keys(locales.en).sort());
  });

  it.each(["es", "ja"] as const)("%s uses the same interpolation placeholders as en", (lang) => {
    for (const [key, value] of Object.entries(locales.en)) {
      expect(placeholders(locales[lang][key]), key).toEqual(placeholders(value));
    }
  });

  it.each(["en", "es", "ja"] as const)("%s has no empty strings", (lang) => {
    expect(Object.entries(locales[lang]).filter(([, v]) => !v.trim())).toEqual([]);
  });
});

describe("language handling", () => {
  it("maps a regional tag onto the bundled language and selects it in the switcher", async () => {
    render(<LanguageSwitcher />);

    await act(() => i18n.changeLanguage("es-ES"));

    expect(i18n.resolvedLanguage).toBe("es");
    expect(screen.getByRole("combobox")).toHaveValue("es");
    expect(screen.getByRole("option", { name: "Español" })).toHaveProperty("selected", true);
  });

  it("keeps <html lang> and the document title in sync with the language", async () => {
    render(<LanguageSwitcher />);

    await userEvent.selectOptions(screen.getByRole("combobox"), "ja");

    expect(document.documentElement.lang).toBe("ja");
    expect(document.title).toBe("タスク管理");

    await act(() => i18n.changeLanguage("en"));

    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("Task Manager");
  });

  it("falls back to English for an unsupported language", async () => {
    await act(() => i18n.changeLanguage("fr"));

    expect(i18n.t("nav.logout")).toBe("Log out");
  });

  it("labels the next status with a dedicated string in every language", async () => {
    const expected = { en: "Mark as in progress", es: "Marcar como en progreso", ja: "進行中に変更" };
    for (const [lang, label] of Object.entries(expected)) {
      await act(() => i18n.changeLanguage(lang));
      const { unmount } = renderPage(<TaskCard task={task() as unknown as Task} />);

      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
      unmount();
    }
  });
});
