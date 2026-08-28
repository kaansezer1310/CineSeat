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
    // Faz 6 DÜZELTMESİ: burada #a181ba vardı — tabandan (#8765a3) AÇIK bir
    // ton. --color-purple-dark birincil butonun HOVER ZEMİNİ olduğu için
    // üzerindeki beyaz metin 3.30:1'e düşüyordu (WCAG AA 4.5 ister).
    // Artık gerçekten koyulaşıyor; beyaz metinle 6.76:1.
    // Kontrastın kendisi contrast.test.js'te doğrulanıyor.
    expect(css).toContain("--color-purple-dark: #6d4f85;");
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

  it("poster katmanı token'larını temadan bağımsız tanımlar", () => {
    // Poster üzerindeki katman her iki temada da koyu kalır, bu yüzden
    // dark bloğunda override EDİLMEZ.
    expect(css).toContain("--color-overlay-scrim: rgba(12, 9, 18, 0.82);");
    expect(css).toContain("--color-on-overlay: #f2edf5;");
    expect(css).toContain("--color-on-overlay-accent: #d8b662;");
    expect(css).toContain("--color-overlay-border: rgba(255, 255, 255, 0.14);");
  });

  it("Faz 6: ölü --color-header-* ailesini tamamen kaldırır", () => {
    // Faz 1 header'ı açık yüzeye geçirdi; bu token ailesinin son
    // tüketicisi bir poster katmanı öğesiydi ve yanlış aileyi
    // kullanıyordu. Artık marka çıpası footer.
    //
    // Yorum metinlerini değil, gerçek BİLDİRİMLERİ arıyoruz — dosyadaki
    // açıklama satırı ailenin neden kaldırıldığını anlatmak için adını
    // anmaya devam ediyor.
    const declarations = css.match(/^\s*--color-header-[\w-]+\s*:/gm) ?? [];

    expect(declarations).toEqual([]);
  });

  it("footer token'larını temadan bağımsız tanımlar", () => {
    expect(css).toContain("--color-footer-background: #231C30;");
    expect(css).toContain("--color-footer-text: #EDE7F3;");
    expect(css).toContain("--color-footer-text-muted: #A99BBB;");
    expect(css).toContain("--color-footer-heading: #FFFFFF;");
    expect(css).toContain("--color-footer-border: rgba(255, 255, 255, 0.11);");
  });

  it("Faz 6: her tema için eksiksiz durum ve desen token'ları tanımlar", () => {
    // Dolgu üzerindeki metin: light'ta yeşil koyu (beyaz metin),
    // dark'ta yeşil açık (koyu metin).
    expect(css).toContain("--color-on-success: #FFFFFF;");
    expect(css).toContain("--color-on-success: #0c120e;");

    // Geçici kilit deseni ve hero perdesi tema başına ayrı.
    expect(css).toContain("--color-seat-locked-stripe: rgba(91, 62, 142, 0.5);");
    expect(css).toContain(
      "--color-seat-locked-stripe: rgba(135, 101, 163, 0.55);"
    );
    expect(css.match(/--gradient-hero-scrim:/g)).toHaveLength(2);
  });
});
