import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormField from "./FormField.jsx";

/**
 * Yönetim formlarında sık rastlanan bir eksik, etiketin girdiye hiç
 * bağlanmamış olması: ekran okuyucu alanın ne olduğunu söyleyemez, etikete
 * tıklamak odağı taşımaz. FormField bu bağı otomatik kuruyor; buradaki
 * testler bağın kopmamasını güvence altına alıyor.
 */
function renderField(props = {}) {
  return render(
    <FormField label="Şehir adı" {...props}>
      {(alanProps) => <input {...alanProps} />}
    </FormField>
  );
}

describe("FormField etiket bağlama", () => {
  it("etiketi girdiye bağlar", () => {
    renderField();

    // getByLabelText yalnizca bag kuruluysa bulur.
    expect(screen.getByLabelText("Şehir adı")).toBeInTheDocument();
  });

  it("zorunlu alanı yıldızla işaretler", () => {
    renderField({ required: true });

    expect(screen.getByLabelText(/Şehir adı \*/)).toBeInTheDocument();
  });

  it("aynı sayfadaki iki alan farklı id alır", () => {
    render(
      <>
        <FormField label="Şehir adı">{(p) => <input {...p} />}</FormField>
        <FormField label="İlçe adı">{(p) => <input {...p} />}</FormField>
      </>
    );

    const sehir = screen.getByLabelText("Şehir adı");
    const ilce = screen.getByLabelText("İlçe adı");

    // Cakisan id, etiket tiklamasini yanlis alana gotururdu.
    expect(sehir.id).not.toBe(ilce.id);
  });
});

describe("FormField hata durumu", () => {
  it("hatasızken alanı geçerli bırakır", () => {
    renderField();

    const input = screen.getByLabelText("Şehir adı");

    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("hata varken alanı geçersiz işaretler", () => {
    renderField({ error: "Bu alan zorunludur." });

    expect(screen.getByLabelText("Şehir adı")).toHaveAttribute("aria-invalid", "true");
  });

  it("hata metnini alana iliştirir", () => {
    renderField({ error: "Bu alan zorunludur." });

    const input = screen.getByLabelText("Şehir adı");

    // Ekran okuyucu alana gelince hatayi da okumali.
    expect(input).toHaveAccessibleDescription("Bu alan zorunludur.");
  });

  it("ipucu metnini alana iliştirir", () => {
    renderField({ hint: "En fazla 100 karakter." });

    expect(screen.getByLabelText("Şehir adı"))
      .toHaveAccessibleDescription("En fazla 100 karakter.");
  });

  it("hata ve ipucu birlikteyken ikisini de iliştirir", () => {
    renderField({ error: "Bu alan zorunludur.", hint: "En fazla 100 karakter." });

    const input = screen.getByLabelText("Şehir adı");

    expect(input).toHaveAccessibleDescription("Bu alan zorunludur. En fazla 100 karakter.");
  });
});

describe("FormField farklı girdi tipleri", () => {
  it("select ile de çalışır", () => {
    render(
      <FormField label="Şehir" error="Seçim yapın.">
        {(alanProps) => (
          <select {...alanProps}>
            <option value="">Seçiniz</option>
            <option value="1">İstanbul</option>
          </select>
        )}
      </FormField>
    );

    const select = screen.getByLabelText("Şehir");

    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("textarea ile de çalışır", () => {
    render(
      <FormField label="Açıklama">
        {(alanProps) => <textarea {...alanProps} />}
      </FormField>
    );

    expect(screen.getByLabelText("Açıklama").tagName).toBe("TEXTAREA");
  });
});
