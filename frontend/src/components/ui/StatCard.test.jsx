import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import StatCard from "./StatCard.jsx";

describe("StatCard", () => {
  it("etiket, değer ve birimi gösterir", () => {
    render(<StatCard label="Toplam Gelir" value="12.400" suffix="TL" />);

    expect(
      screen.getByRole("heading", { name: "Toplam Gelir" })
    ).toBeInTheDocument();
    expect(screen.getByText(/12\.400/)).toBeInTheDocument();
    expect(screen.getByText("TL")).toBeInTheDocument();
  });

  it("yükleniyorken değer yerine iskelet gösterir", () => {
    const { container } = render(
      <StatCard label="Toplam Gelir" value="12.400" isLoading />
    );

    expect(screen.queryByText(/12\.400/)).not.toBeInTheDocument();
    expect(
      container.querySelector(".stat-card-skeleton")
    ).toBeInTheDocument();
  });

  it("pozitif değişimi yukarı yönlü işaretler", () => {
    const { container } = render(
      <StatCard label="Bilet" value={42} change={12} changeLabel="geçen aya göre" />
    );

    expect(
      container.querySelector(".stat-card-change-up")
    ).toBeInTheDocument();
    expect(screen.getByText(/geçen aya göre/)).toBeInTheDocument();
  });

  it("negatif değişimi aşağı yönlü işaretler ve mutlak değeri yazar", () => {
    const { container } = render(
      <StatCard label="Bilet" value={42} change={-8} />
    );

    const change = container.querySelector(".stat-card-change-down");
    expect(change).toBeInTheDocument();
    // Yön okla gösteriliyor; metinde "-8" değil "8" olmalı.
    expect(change.textContent).toContain("%8");
    expect(change.textContent).not.toContain("-8");
  });

  it("değişim verilmezse gösterge hiç render edilmez", () => {
    const { container } = render(<StatCard label="Bilet" value={42} />);

    expect(container.querySelector(".stat-card-change")).toBeNull();
  });

  it("yükleniyorken değişim göstergesini de gizler", () => {
    const { container } = render(
      <StatCard label="Bilet" value={42} change={12} isLoading />
    );

    expect(container.querySelector(".stat-card-change")).toBeNull();
  });
});
