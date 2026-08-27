// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./admin.css", import.meta.url), "utf-8");

/**
 * Faz 5 — yönetim paneli token'lara bağlandı.
 *
 * Bu testlerin asıl işi Faz 6'yı korumak: koyu tema yalnızca token'ları
 * yeniden tanımlayarak kuruluyor, dolayısıyla admin.css'e sızacak HAM bir
 * renk değeri koyu temada sessizce yanlış görünürdü. Aşağıdaki "ham renk
 * yok" testi tam olarak bunu yakalar.
 */
describe("admin.css", () => {
  it("hiçbir yerde ham renk değeri kullanmaz (koyu tema token'lara bağlı)", () => {
    // Faz 5 öncesinde burada #2b6cb0, #e53e3e ve #111 vardı; üçü de
    // tema değişince olduğu gibi kalıp yanlış kontrast üretiyordu.
    const rawColors = css.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) ?? [];

    expect(rawColors).toEqual([]);
  });

  it("boşluk, yarıçap, tipografi ve ağırlık ölçeklerini token'dan alır", () => {
    expect(css).toContain("var(--space-");
    expect(css).toContain("var(--radius-");
    expect(css).toContain("var(--text-");
    expect(css).toContain("var(--weight-");
    expect(css).toContain("var(--duration-");
  });

  it("panelde müşteri sitesinden daha sıkı bir yoğunluk profili kullanır", () => {
    // spec §8: aynı token'lar, daha sıkı basamaklar.
    expect(css).toContain(".admin-content {");
    expect(css).toMatch(
      /\.admin-content \{[^}]*padding: var\(--space-8\);/
    );

    // Tablo satırı: dikey dolgu yatayın bir basamak altında.
    expect(css).toMatch(
      /\.admin-table th,\s*\n\.admin-table td \{[^}]*padding: var\(--space-3\) var\(--space-4\);/
    );
  });

  it("dashboard kartlarını grafiklerle aynı ızgara ritmine hizalar", () => {
    // Önceden kartlar minmax(250px)/gap 24px, grafikler minmax(320px)/
    // gap 20px kullanıyordu; sütunlar üst üste düşmüyordu.
    expect(css).toContain("--admin-grid-min: 320px;");
    expect(css).toContain("--admin-grid-gap: var(--space-5);");

    // Yalnızca taban kurallar; dar ekran override'ları (media query
    // içinde tek sütuna düşüren kurallar) bilinçli olarak farklı.
    const baseRules = css.match(
      /^\.admin-(stats-cards|chart-grid) \{[^}]*\}/gm
    );

    expect(baseRules).toHaveLength(2);
    baseRules.forEach((rule) => {
      expect(rule).toContain("minmax(var(--admin-grid-min), 1fr)");
      expect(rule).toContain("gap: var(--admin-grid-gap);");
    });
  });

  it("kenar çubuğunu yapışkan tutar ve kendi içinde kaydırır", () => {
    expect(css).toMatch(
      /\.admin-sidebar \{[^}]*position: sticky;/
    );
    expect(css).toMatch(/\.admin-sidebar \{[^}]*overflow-y: auto;/);
    expect(css).toContain("--admin-topbar-height:");
  });

  it("recharts çubuklarını tema duyarlı seri token'larına bağlar", () => {
    // recharts fill'i öznitelik olarak yazıyor; öznitelikte var()
    // çözülmediği için CSS fill özelliği onu geçmek zorunda.
    expect(css).toContain("fill: var(--chart-series-1);");
    expect(css).toContain("fill: var(--chart-series-2);");
  });
});
