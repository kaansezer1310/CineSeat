// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./base.css", import.meta.url), "utf-8");

describe("base.css", () => {
  it("kutu modelini sıfırlar", () => {
    expect(css).toContain("box-sizing: border-box;");
  });

  it("body'de tema token'larını ve ambient glow'u kullanır", () => {
    expect(css).toContain("var(--color-ambient-glow) 0%");
    expect(css).toContain("color: var(--color-text);");
    expect(css).toContain("font-family: var(--font-ui);");
    expect(css).toContain("font-size: var(--text-base);");
  });

  it("global :focus-visible halkası tanımlar", () => {
    expect(css).toContain(":focus-visible {");
    expect(css).toContain("outline: 2px solid var(--color-focus-ring);");
  });

  it("linklerin ve butonların varsayılan tarayıcı stilini sıfırlar", () => {
    expect(css).toContain("text-decoration: none;");
    expect(css).toContain("border: 0;");
  });
});
