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
    expect(css).toContain(':root[data-theme="dark"] {');
    expect(css).not.toContain('\n[data-theme="dark"] {');
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("--color-background: #0c0912;");
    expect(css).toContain("--color-surface: #1b1425;");
    expect(css).toContain("--color-purple: #8765a3;");
    expect(css).toContain("--color-focus-ring: var(--color-yellow);");
  });

  it("token sözleşmesi için eklenen yeni renk token'larını light temada tanımlar", () => {
    expect(css).toContain("--color-purple-dark: #4A3175;");
    expect(css).toContain("--color-accent-soft: #FBF0D8;");
    expect(css).toContain("--color-warn: #B5761F;");
    expect(css).toContain("--color-on-primary: #FFFFFF;");
    expect(css).toContain("--color-on-danger: #FFFFFF;");
    expect(css).toContain(
      "--color-skeleton-shimmer: rgba(255, 255, 255, 0.5);"
    );
  });

  it("token sözleşmesi için eklenen yeni renk token'larını dark temada tanımlar", () => {
    expect(css).toContain("--color-purple-dark: #a181ba;");
    expect(css).toContain("--color-accent-soft: rgba(208, 172, 89, 0.16);");
    expect(css).toContain("--color-warn: #ddbd70;");
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

  it("footer token'larını temadan bağımsız tanımlar", () => {
    expect(css).toContain("--color-footer-background: #231C30;");
    expect(css).toContain("--color-footer-text: #EDE7F3;");
    expect(css).toContain("--color-footer-text-muted: #A99BBB;");
    expect(css).toContain("--color-footer-heading: #FFFFFF;");
    expect(css).toContain("--color-footer-border: rgba(255, 255, 255, 0.11);");
  });
});
