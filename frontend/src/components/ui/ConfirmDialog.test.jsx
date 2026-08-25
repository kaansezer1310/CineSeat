import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ConfirmDialog from "./ConfirmDialog.jsx";

function renderDialog(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  const result = render(
    <ConfirmDialog
      isOpen
      title="Filmi arşivle"
      description="Kayıt silinmez, geri alınabilir."
      confirmLabel="Arşivle"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />
  );

  return { onConfirm, onCancel, ...result };
}

describe("ConfirmDialog", () => {
  it("kapalıyken hiçbir şey render etmez", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Filmi arşivle"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("başlık ve açıklamayı erişilebilir biçimde bağlar", () => {
    renderDialog();

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Filmi arşivle");
    expect(dialog).toHaveAccessibleDescription(
      "Kayıt silinmez, geri alınabilir."
    );
  });

  it("açılışta odağı onay butonuna taşır", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: "Arşivle" })).toHaveFocus();
  });

  it("onay ve vazgeç geri çağrımlarını tetikler", () => {
    const { onConfirm, onCancel } = renderDialog();

    fireEvent.click(screen.getByRole("button", { name: "Arşivle" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Vazgeç" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Escape ile kapanır", () => {
    const { onCancel } = renderDialog();

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("arka plana tıklayınca kapanır, içeriğe tıklayınca kapanmaz", () => {
    const { onCancel, container } = renderDialog();

    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.mouseDown(container.querySelector(".dialog-backdrop"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("Tab odağı diyaloğun içinde tutar", () => {
    renderDialog();

    const cancel = screen.getByRole("button", { name: "Vazgeç" });
    const confirm = screen.getByRole("button", { name: "Arşivle" });
    const dialog = screen.getByRole("dialog");

    // Odak sondaki butondayken Tab başa sarmalı.
    confirm.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(cancel).toHaveFocus();

    // Baştaki butondan Shift+Tab ile sona.
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
  });

  it("işlem sürerken butonları kilitler", () => {
    renderDialog({ isPending: true });

    expect(screen.getByRole("button", { name: "İşleniyor…" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Vazgeç" })).toBeDisabled();
  });

  it("danger varyantında onay butonuna uyarı sınıfı verir", () => {
    renderDialog({ variant: "danger" });

    expect(screen.getByRole("button", { name: "Arşivle" })).toHaveClass(
      "admin-btn-delete"
    );
  });
});
