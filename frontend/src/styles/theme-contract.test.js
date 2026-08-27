// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Faz 6 — tema sözleşmesinin bekçisi.
 *
 * Spec §4 iki kural koyuyor:
 *   1. Dark tema YALNIZCA tokens.css'te token'ları yeniden tanımlar.
 *   2. Hiçbir bileşen CSS'i `[data-theme="dark"]` altında dallanmaz.
 *
 * Bu kurallar yorumla korunuyordu; bir geliştirici bileşenin içine tema
 * koşulu ya da ham bir renk yazdığında hiçbir şey uyarmıyordu. Faz 6
 * öncesinde tam olarak bu olmuştu: admin.css'te üç ham renk, home.css'te
 * bir tema dallanması, App.css'te on ham renk birikmişti.
 */

const srcDir = fileURLToPath(new URL("..", import.meta.url));
const TOKEN_SOURCE = join("styles", "tokens.css");

function collectCssFiles(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      collectCssFiles(full, found);
    } else if (entry.endsWith(".css")) {
      found.push(full);
    }
  }

  return found;
}

const cssFiles = collectCssFiles(srcDir).map((path) => ({
  relative: path.slice(srcDir.length),
  content: readFileSync(path, "utf-8"),
}));

describe("tema sözleşmesi", () => {
  it("proje genelinde CSS dosyalarını bulur (tarama gerçekten çalışıyor)", () => {
    expect(cssFiles.length).toBeGreaterThan(5);
    expect(cssFiles.map((f) => f.relative)).toContain(TOKEN_SOURCE);
  });

  it("tokens.css dışında hiçbir dosya ham renk değeri içermez", () => {
    const offenders = cssFiles
      .filter((file) => file.relative !== TOKEN_SOURCE)
      .map((file) => ({
        file: file.relative,
        colors: file.content.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) ?? [],
      }))
      .filter((entry) => entry.colors.length > 0);

    expect(offenders).toEqual([]);
  });

  it("tokens.css dışında hiçbir dosya temaya göre dallanmaz", () => {
    const offenders = cssFiles
      .filter((file) => file.relative !== TOKEN_SOURCE)
      .filter((file) => file.content.includes("[data-theme="))
      .map((file) => file.relative);

    expect(offenders).toEqual([]);
  });

  it("dark tema, light temada tanımlı olmayan bir token uydurmaz", () => {
    const tokens = cssFiles.find((f) => f.relative === TOKEN_SOURCE).content;
    const [lightBlock, darkBlock] = [
      tokens.slice(tokens.indexOf(":root {"), tokens.indexOf(':root[data-theme="dark"]')),
      tokens.slice(tokens.indexOf(':root[data-theme="dark"]')),
    ];

    const declared = (block) =>
      new Set((block.match(/^\s*(--[\w-]+):/gm) ?? []).map((m) => m.trim()));

    const lightTokens = declared(lightBlock);
    const orphans = [...declared(darkBlock)].filter(
      (token) => !lightTokens.has(token)
    );

    // Dark blok yalnızca ÜZERİNE YAZAR; yeni bir token tanımlaması
    // light temada o değişkenin tanımsız kalması demektir.
    expect(orphans).toEqual([]);
  });

  it("hareket hassasiyeti global olarak onurlandırılır", () => {
    const base = cssFiles.find((f) => f.relative.endsWith("base.css")).content;

    expect(base).toContain("@media (prefers-reduced-motion: reduce)");
    expect(base).toContain("animation-duration: 0.01ms !important;");
    expect(base).toContain("transition-duration: 0.01ms !important;");
  });
});
