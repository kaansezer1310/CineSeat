// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf-8");

describe("tokens.css", () => {
  it(":root paletini light (varsayılan) olarak tanımlar", () => {
    expect(css).toContain("color-scheme: light;");
    expect(css).toContain("--color-background: #FAF8FC;");
    expect(css).toContain("--color-surface: #FFFFFF;");
    expect(css).toContain("--color-purple: #5B3E8E;");
    expect(css).toContain("--color-yellow: #E0A82E;");
    expect(css).toContain("--color-text: #1E1A26;");
  });

  it('[data-theme="dark"] altında orijinal dark palet değerlerini korur', () => {
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("--color-background: #0c0912;");
    expect(css).toContain("--color-surface: #1b1425;");
    expect(css).toContain("--color-purple: #8765a3;");
    expect(css).toContain("--color-focus-ring: var(--color-yellow);");
  });

  it("spacing, radius, gölge, motion, z-index ve container ölçeklerini tanımlar", () => {
    expect(css).toContain("--space-4: 16px;");
    expect(css).toContain("--radius-lg: 14px;");
    expect(css).toContain(
      "--shadow-md: 0 10px 30px var(--color-shadow), 0 2px 6px var(--color-shadow);"
    );
    expect(css).toContain("--duration-base: 180ms;");
    expect(css).toContain("--z-modal: 400;");
    expect(css).toContain("--container-lg: 1200px;");
  });

  it("gövde fontunu Plus Jakarta Sans olarak tanımlar", () => {
    expect(css).toContain(
      '--font-ui: "Plus Jakarta Sans", "Segoe UI", Arial, sans-serif;'
    );
  });

  it("header ve overlay token'larını temadan bağımsız, orijinal değerleriyle korur", () => {
    expect(css).toContain("--color-header-background: rgba(12, 9, 18, 0.9);");
    expect(css).toContain("--color-overlay-scrim: rgba(12, 9, 18, 0.82);");
  });
});
