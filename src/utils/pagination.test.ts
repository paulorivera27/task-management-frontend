import { describe, expect, it } from "vitest";
import { pageWindow, parsePage, parseStatus } from "./pagination";

describe("parsePage", () => {
  it.each([
    ["3", 3],
    ["1", 1],
    [null, 1],
    ["0", 1],
    ["-2", 1],
    ["abc", 1],
    ["2.5", 1],
    ["", 1],
  ])("%j -> %i", (input, expected) => {
    expect(parsePage(input)).toBe(expected);
  });
});

describe("parseStatus", () => {
  it("accepts known statuses only", () => {
    expect(parseStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(parseStatus("in_progress")).toBeNull();
    expect(parseStatus("DONE")).toBeNull();
    expect(parseStatus(null)).toBeNull();
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("collapses long runs into a gap", () => {
    expect(pageWindow(1, 20)).toEqual([1, 2, "gap", 20]);
    expect(pageWindow(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
    expect(pageWindow(20, 20)).toEqual([1, "gap", 19, 20]);
  });

  it("shows a single skipped page instead of a gap", () => {
    expect(pageWindow(4, 8)).toEqual([1, 2, 3, 4, 5, "gap", 8]);
    expect(pageWindow(5, 8)).toEqual([1, "gap", 4, 5, 6, 7, 8]);
  });

  it("never lists a page twice or out of range", () => {
    for (let total = 1; total <= 30; total++) {
      for (let current = 1; current <= total; current++) {
        const pages = pageWindow(current, total).filter((p) => p !== "gap");
        expect(new Set(pages).size).toBe(pages.length);
        expect(pages).toEqual([...pages].sort((a, b) => a - b));
        expect(pages).toContain(current);
        expect(pages[0]).toBe(1);
        expect(pages.at(-1)).toBe(total);
      }
    }
  });
});
