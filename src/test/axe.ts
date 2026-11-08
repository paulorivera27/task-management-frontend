import axe from "axe-core";
import { expect } from "vitest";

// jsdom has no layout or computed colours, so contrast is checked in a real browser instead.
export async function expectNoA11yViolations(root: Element = document.body) {
  document.documentElement.lang = "en";
  document.title = "Test";

  const { violations } = await axe.run(root, {
    rules: { "color-contrast": { enabled: false } },
  });

  expect(
    violations.map(
      (v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    ),
  ).toEqual([]);
}
