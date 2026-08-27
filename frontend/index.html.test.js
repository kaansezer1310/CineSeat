// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf-8");

describe("index.html — FOUC koruma script'i", () => {
  it("temayı <html> üzerine, light varsayılanıyla uygular", () => {
    expect(html).toContain("document.documentElement.dataset.theme");
    expect(html).toContain('stored === "dark" ? "dark" : "light"');
    expect(html).not.toContain("document.body.dataset.theme");
  });

  it("script <head> içinde, </head> kapanışından önce çalışır", () => {
    const scriptIndex = html.indexOf(
      "document.documentElement.dataset.theme"
    );
    const headCloseIndex = html.indexOf("</head>");
    const bodyOpenIndex = html.indexOf("<body>");

    expect(scriptIndex).toBeGreaterThan(-1);
    expect(scriptIndex).toBeLessThan(headCloseIndex);
    expect(scriptIndex).toBeLessThan(bodyOpenIndex);
  });
});
