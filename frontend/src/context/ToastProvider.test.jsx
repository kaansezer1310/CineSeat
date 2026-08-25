import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "./ToastProvider.jsx";
import useToast from "../hooks/useToast.js";

function ToastProbe() {
  const { showToast, showSuccess, showError } = useToast();

  return (
    <div>
      <button type="button" onClick={() => showSuccess("Film arşivlendi.")}>
        Başarı
      </button>
      <button type="button" onClick={() => showError("Arşivleme başarısız.")}>
        Hata
      </button>
      <button
        type="button"
        onClick={() => showToast({ message: "Kalıcı", duration: 0 })}
      >
        Kalıcı
      </button>
    </div>
  );
}

function renderProbe() {
  render(
    <ToastProvider>
      <ToastProbe />
    </ToastProvider>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("başlangıçta hiç bildirim göstermez", () => {
    renderProbe();

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("başarı bildirimini polite olarak duyurur", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Başarı" }));

    const toast = screen.getByRole("status");
    expect(toast).toHaveTextContent("Film arşivlendi.");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });

  it("hata bildirimini assertive olarak duyurur", () => {
    // Hata mesajı ekran okuyucunun sözünü kesmeli.
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Hata" }));

    const toast = screen.getByRole("alert");
    expect(toast).toHaveTextContent("Arşivleme başarısız.");
    expect(toast).toHaveAttribute("aria-live", "assertive");
  });

  it("süre dolunca kendiliğinden kaybolur", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Başarı" }));
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("duration 0 verilirse kendiliğinden kaybolmaz", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Kalıcı" }));

    act(() => {
      vi.advanceTimersByTime(20000);
    });

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("kapat düğmesiyle elle kapatılabilir", () => {
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Başarı" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Bildirimi kapat" })
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("birden fazla bildirim üst üste birikir", () => {
    // `alert()` ile mümkün olmayan şey: iki mesaj kullanıcıyı iki kez durdurmaz.
    renderProbe();

    fireEvent.click(screen.getByRole("button", { name: "Başarı" }));
    fireEvent.click(screen.getByRole("button", { name: "Hata" }));

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("sağlayıcı dışında useToast hata fırlatır", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => render(<ToastProbe />)).toThrow(
      /must be used within a ToastProvider/
    );

    consoleError.mockRestore();
  });
});
