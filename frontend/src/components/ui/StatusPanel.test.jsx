import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import StatusPanel from "./StatusPanel.jsx";
import QueryState from "./QueryState.jsx";
import { ForbiddenError, ApiError } from "../../services/errors.js";

describe("StatusPanel", () => {
  it("yükleniyor durumunu polite duyurur", () => {
    render(<StatusPanel variant="loading" />);

    const panel = screen.getByRole("status");
    expect(panel).toHaveTextContent("Yükleniyor…");
    expect(panel).toHaveAttribute("aria-live", "polite");
  });

  it("hata durumunu assertive duyurur", () => {
    render(<StatusPanel variant="error" description="Sunucuya ulaşılamadı." />);

    const panel = screen.getByRole("alert");
    expect(panel).toHaveTextContent("Bir şeyler ters gitti");
    expect(panel).toHaveTextContent("Sunucuya ulaşılamadı.");
    expect(panel).toHaveAttribute("aria-live", "assertive");
  });

  it("yetkisiz durumunu ayrı başlıkla gösterir", () => {
    render(<StatusPanel variant="forbidden" />);

    expect(
      screen.getByText("Bu içeriği görme yetkiniz yok")
    ).toBeInTheDocument();
  });

  it("özel başlık varsayılanı geçersiz kılar", () => {
    render(<StatusPanel variant="error" title="Filmler alınamadı" />);

    expect(screen.getByText("Filmler alınamadı")).toBeInTheDocument();
  });
});

describe("QueryState", () => {
  it("yükleniyorken içeriği render etmez", () => {
    render(
      <QueryState isLoading loadingText="Filmler yükleniyor…">
        <p>İçerik</p>
      </QueryState>
    );

    expect(screen.getByText("Filmler yükleniyor…")).toBeInTheDocument();
    expect(screen.queryByText("İçerik")).not.toBeInTheDocument();
  });

  it("hata varsa tekrar dene düğmesi sunar", () => {
    const onRetry = vi.fn();

    render(
      <QueryState
        isLoading={false}
        error={new ApiError("Sunucuya ulaşılamıyor.", { status: 500 })}
        onRetry={onRetry}
      >
        <p>İçerik</p>
      </QueryState>
    );

    fireEvent.click(screen.getByRole("button", { name: "Tekrar Dene" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("403'te yetkisiz paneli gösterir ve tekrar denemeyi önermez", () => {
    // Yetki yoksa tekrar denemek işe yaramaz; kullanıcıyı boşuna uğraştırma.
    render(
      <QueryState
        isLoading={false}
        error={new ForbiddenError("Bu kaydı görüntüleyemezsiniz.")}
        onRetry={vi.fn()}
      >
        <p>İçerik</p>
      </QueryState>
    );

    expect(
      screen.getByText("Bu içeriği görme yetkiniz yok")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Tekrar Dene" })
    ).not.toBeInTheDocument();
  });

  it("hata ve yükleme yoksa içeriği geçirir", () => {
    render(
      <QueryState isLoading={false} error={null}>
        <p>İçerik</p>
      </QueryState>
    );

    expect(screen.getByText("İçerik")).toBeInTheDocument();
  });
});
