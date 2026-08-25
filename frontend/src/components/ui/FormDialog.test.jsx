import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FormDialog from "./FormDialog.jsx";

/**
 * Yönetim ekranlarının tamamı ekleme/düzenleme için bu modalı kullanıyor.
 * Buradaki testler klavye sözleşmesini sabitliyor: odak modalın içine girer,
 * içinde döner, Escape kapatır ve kapanışta odak çağırana geri döner.
 */
function renderDialog(props = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();

  const utils = render(
    <FormDialog
      isOpen
      title="Şehir ekle"
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    >
      <input aria-label="Şehir adı" defaultValue="" />
    </FormDialog>
  );

  return { ...utils, onSubmit, onCancel };
}

describe("FormDialog erişilebilirlik", () => {
  it("modal olarak işaretlenir ve başlığıyla adlandırılır", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    // Ekran okuyucu diyaloğu açarken adını duyurabilmeli.
    expect(dialog).toHaveAccessibleName("Şehir ekle");
  });

  it("kapalıyken hiçbir şey çizmez", () => {
    render(
      <FormDialog isOpen={false} title="Şehir ekle">
        <input aria-label="Şehir adı" />
      </FormDialog>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("açılışta odağı ilk alana taşır", () => {
    renderDialog();

    expect(screen.getByLabelText("Şehir adı")).toHaveFocus();
  });

  it("Escape ile kapanır", () => {
    const { onCancel } = renderDialog();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Escape dışındaki tuşlar kapatmaz", () => {
    const { onCancel } = renderDialog();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "a" });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Enter" });

    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe("FormDialog odak tuzağı", () => {
  it("son öğeden Tab, başa sarar", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");
    const kaydet = screen.getByRole("button", { name: "Kaydet" });
    const ilkAlan = screen.getByLabelText("Şehir adı");

    kaydet.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });

    // Odak modalın dışına kaçmamalı; arkadaki sayfaya geçilemez.
    expect(ilkAlan).toHaveFocus();
  });

  it("ilk öğeden Shift+Tab, sona sarar", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");
    const ilkAlan = screen.getByLabelText("Şehir adı");
    const kaydet = screen.getByRole("button", { name: "Kaydet" });

    ilkAlan.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });

    expect(kaydet).toHaveFocus();
  });

  it("aradaki öğelerde Tab'a karışmaz", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");
    const vazgec = screen.getByRole("button", { name: "Vazgeç" });

    vazgec.focus();
    const olay = fireEvent.keyDown(dialog, { key: "Tab" });

    // Uçlarda değilken tarayıcının doğal sırası çalışsın diye engellenmemeli.
    expect(olay).toBe(true);
  });
});

describe("FormDialog davranışı", () => {
  it("gönderimde onSubmit çağırır, sayfayı yeniden yüklemez", () => {
    const { onSubmit } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Kaydet" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("işlem sürerken iki buton da kilitlenir", () => {
    renderDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "Kaydediliyor…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Vazgeç" })).toBeDisabled();
  });

  it("hata mesajını duyurulur biçimde gösterir", () => {
    renderDialog({ error: "Şehir adı zaten kayıtlı." });

    // role="alert": kullanıcı forma odaklıyken hata sessizce eklenmemeli.
    expect(screen.getByRole("alert")).toHaveTextContent("Şehir adı zaten kayıtlı.");
  });

  it("kapanışta odağı çağıran öğeye geri verir", () => {
    render(<button type="button">Şehir ekle</button>);
    const acan = screen.getByRole("button", { name: "Şehir ekle" });
    acan.focus();

    const { unmount } = render(
      <FormDialog isOpen title="Şehir ekle" onCancel={vi.fn()}>
        <input aria-label="Şehir adı" />
      </FormDialog>
    );

    unmount();

    // Klavye kullanıcısı listenin başına savrulmamalı.
    expect(acan).toHaveFocus();
  });
});
