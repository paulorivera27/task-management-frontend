import "../i18n";
import i18n from "i18next";
import client, { setAccessToken } from "../lib/apollo";
import { server } from "./server";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";

const unmocked: string[] = [];

// MSW rejects an unhandled request, but app code often swallows the rejection, so record it and fail the test.
beforeAll(() =>
  server.listen({
    async onUnhandledFrame({ frame, defaults }) {
      unmocked.push(await frame.getUnhandledMessage());
      defaults.error();
    },
  }),
);

beforeEach(async () => {
  unmocked.length = 0;
  await i18n.changeLanguage("en");
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  setAccessToken(null);
  await client.clearStore();

  if (unmocked.length) {
    throw new Error(`Unmocked requests:\n${unmocked.join("\n")}`);
  }
});

afterAll(() => server.close());
