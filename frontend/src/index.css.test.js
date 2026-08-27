// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./index.css", import.meta.url), "utf-8");

describe("index.css", () => {
  it("tüm token katmanı dosyalarını doğru sırada import eder", () => {
    const imports = [...css.matchAll(/@import\s+"([^"]+)";/g)].map(
      (m) => m[1]
    );
    expect(imports).toEqual([
      "./styles/tokens.css",
      "./styles/base.css",
      "./styles/primitives.css",
      "./styles/utilities.css",
    ]);
  });
});
