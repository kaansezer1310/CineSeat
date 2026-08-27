// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./tokens.css", import.meta.url), "utf-8");

/**
 * Faz 6 (a11y turu) — WCAG 2.1 AA kontrast bekçisi.
 *
 * Değerleri elle kopyalamıyoruz: tokens.css'ten OKUYORUZ. Böylece bir
 * paleti değiştiren kişi, kontrastı bozduğu anda burada yakalanır.
 *
 * Faz 6 bu testle üç gerçek hata buldu:
 *   - dark `--color-purple` metin olarak yüzeyde 3.77:1 (link/nav rengi)
 *   - dark `--color-purple-dark` tabandan AÇIKTI; birincil butonun hover
 *     zemininde beyaz metin 3.30:1'e düşüyordu
 *   - `--color-success` üzerindeki metin rengi ham yazılmıştı
 */

function parseThemeTokens(source) {
  const darkStart = source.indexOf(':root[data-theme="dark"]');
  const blocks = {
    light: source.slice(source.indexOf(":root {"), darkStart),
    dark: source.slice(darkStart),
  };

  return Object.fromEntries(
    Object.entries(blocks).map(([theme, block]) => {
      const entries = [...block.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)].map(
        ([, name, value]) => [name, value.trim()]
      );

      return [theme, Object.fromEntries(entries)];
    })
  );
}

const themes = parseThemeTokens(css);

function channel(value) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : clean;

  const [r, g, b] = [0, 2, 4].map((i) =>
    channel(parseInt(full.slice(i, i + 2), 16))
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
  const [a, b] = [luminance(foreground), luminance(background)];
  const [high, low] = a > b ? [a, b] : [b, a];

  return (high + 0.05) / (low + 0.05);
}

/** Light temada tanımlı olup dark'ta override edilmeyen token'lar miras alınır. */
function resolve(theme, token) {
  const value = themes[theme][token] ?? themes.light[token];

  expect(value, `${token} (${theme}) tanımlı olmalı`).toBeDefined();
  expect(value, `${token} (${theme}) hex olmalı`).toMatch(/^#[0-9a-fA-F]{3,6}$/);

  return value;
}

// [etiket, ön plan token'ı, zemin token'ı, eşik]
// 4.5 = normal metin (AA), 3.0 = büyük metin / arayüz bileşeni (AA)
const PAIRS = [
  ["gövde metni / zemin", "--color-text", "--color-background", 4.5],
  ["gövde metni / yüzey", "--color-text", "--color-surface", 4.5],
  ["soluk metin / zemin", "--color-text-muted", "--color-background", 4.5],
  ["soluk metin / yüzey", "--color-text-muted", "--color-surface", 4.5],
  [
    "soluk metin / soluk yüzey",
    "--color-text-muted",
    "--color-background-soft",
    4.5,
  ],
  ["birincil buton metni", "--color-on-primary", "--color-purple", 4.5],
  ["birincil buton hover", "--color-on-primary", "--color-purple-dark", 4.5],
  ["mor metin / yüzey", "--color-purple-text", "--color-surface", 4.5],
  ["mor metin / zemin", "--color-purple-text", "--color-background", 4.5],
  [
    "mor metin hover / yüzey",
    "--color-purple-text-hover",
    "--color-surface",
    4.5,
  ],
  [
    "ikincil buton metni",
    "--color-purple-text",
    "--color-background-soft",
    4.5,
  ],
  ["altın dolgu üzeri metin", "--color-on-accent", "--color-yellow", 4.5],
  ["altın metin / yüzey", "--color-yellow-text", "--color-surface", 4.5],
  ["başarı dolgusu üzeri metin", "--color-on-success", "--color-success", 4.5],
  ["hata metni / yüzey", "--color-error-text", "--color-surface", 4.5],
  [
    "dolu koltuk metni",
    "--color-seat-occupied-text",
    "--color-seat-occupied-bg",
    3.0,
  ],
  ["footer metni", "--color-footer-text", "--color-footer-background", 4.5],
  [
    "footer soluk metni",
    "--color-footer-text-muted",
    "--color-footer-background",
    4.5,
  ],
];

describe.each(["light", "dark"])("kontrast — %s tema", (theme) => {
  it.each(PAIRS)("%s en az %s:1", (_label, fg, bg, threshold) => {
    const ratio = contrast(resolve(theme, fg), resolve(theme, bg));

    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(threshold);
  });
});

describe("kontrast — bilinçli istisnalar", () => {
  it("pasif (disabled) öğeler kontrast eşiğinden muaftır", () => {
    // WCAG 2.1 SC 1.4.3 "inactive user interface components" için kontrast
    // şartı ARAMAZ. Pasif metni eşiği geçecek kadar koyulaştırmak onu
    // etkin görünümlü yapar ve durumu belirsizleştirir — bu yüzden
    // kasıtlı olarak düşük bırakıldı. Test bu kararı kayıt altına alır.
    const ratio = contrast(
      resolve("light", "--color-disabled-text"),
      resolve("light", "--color-disabled-bg")
    );

    expect(ratio).toBeLessThan(3);
  });
});
