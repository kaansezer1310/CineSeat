// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./primitives.css", import.meta.url), "utf-8");

describe("primitives.css", () => {
  it(".btn varyantlarını tanımlar", () => {
    expect(css).toContain(".btn {");
    expect(css).toContain(".btn--primary {");
    expect(css).toContain("background: var(--color-purple);");
    expect(css).toContain(".btn--secondary {");
    expect(css).toContain(".btn--ghost {");
    expect(css).toContain(".btn--danger {");
  });

  it(".card gölge ölçeğini kullanır", () => {
    expect(css).toContain(".card {");
    expect(css).toContain("box-shadow: var(--shadow-md);");
  });

  it(".input odak ve hata durumlarını tanımlar", () => {
    expect(css).toContain(".input:focus-visible {");
    expect(css).toContain('.input[aria-invalid="true"] {');
  });

  it(".badge ve .chip varyantlarını tanımlar", () => {
    expect(css).toContain(".badge--accent {");
    expect(css).toContain(".badge--success {");
    expect(css).toContain('.chip[aria-pressed="true"],');
  });

  it(".skeleton azaltılmış hareket tercihine uyar", () => {
    expect(css).toContain("@keyframes skeleton-shimmer {");
    expect(css).toContain("@media (prefers-reduced-motion: reduce) {");
  });
});
