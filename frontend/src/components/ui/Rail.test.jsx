import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Rail from "./Rail.jsx";

function renderRail(props) {
  render(
    <MemoryRouter>
      <Rail {...props}>
        <div>Öğe 1</div>
        <div>Öğe 2</div>
      </Rail>
    </MemoryRouter>
  );
}

describe("Rail", () => {
  it("başlığı ve çocukları render eder", () => {
    renderRail({ title: "Vizyondaki Filmler" });

    expect(
      screen.getByRole("heading", { level: 2, name: "Vizyondaki Filmler" })
    ).toBeInTheDocument();
    expect(screen.getByText("Öğe 1")).toBeInTheDocument();
    expect(screen.getByText("Öğe 2")).toBeInTheDocument();
  });

  it("viewAllHref verilince Tümünü gör linkini doğru adrese bağlar", () => {
    renderRail({ title: "Yakında", viewAllHref: "/movies" });

    expect(
      screen.getByRole("link", { name: "Tümünü gör →" })
    ).toHaveAttribute("href", "/movies");
  });

  it("viewAllHref verilmeyince link render edilmez", () => {
    renderRail({ title: "Yakında" });

    expect(
      screen.queryByRole("link", { name: "Tümünü gör →" })
    ).not.toBeInTheDocument();
  });

  it("title ve viewAllHref yoksa başlık satırını hiç render etmez", () => {
    const { container } = render(
      <MemoryRouter>
        <Rail>
          <div>Öğe 1</div>
        </Rail>
      </MemoryRouter>
    );

    expect(
      container.querySelector(".rail-section-heading")
    ).not.toBeInTheDocument();
  });

  it("çocukları role=list konteynerinde render eder", () => {
    renderRail({ title: "Test" });

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("isList false verilince role=list uygulamaz", () => {
    render(
      <MemoryRouter>
        <Rail title="Test" isList={false}>
          <div>Yükleniyor</div>
        </Rail>
      </MemoryRouter>
    );

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
