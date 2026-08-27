// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./utilities.css", import.meta.url), "utf-8");

describe("utilities.css", () => {
  it(".container sayfa genişliğini token'dan alır", () => {
    expect(css).toContain("max-width: var(--container-lg);");
    expect(css).toContain(".container--xl { max-width: var(--container-xl); }");
  });

  it(".rail yatay kaydırmalı şerit tanımlar", () => {
    expect(css).toContain("overflow-x: auto;");
    expect(css).toContain("scroll-snap-type: x proximity;");
  });

  it(".visually-hidden erişilebilirlik yardımcı sınıfını korur", () => {
    expect(css).toContain(".visually-hidden {");
    expect(css).toContain("clip-path: inset(50%);");
  });
});
