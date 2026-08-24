import {
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  describe,
  expect,
  it,
} from "vitest";

import SuccessPage from "./SuccessPage.jsx";

describe("SuccessPage", () => {
  it("rezervasyon durumu yoksa tarafsız mesaj gösterir", () => {
    render(
      <MemoryRouter initialEntries={["/success"]}>
        <SuccessPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Rezervasyon bilgisi bulunamadı.",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Rezervasyon tamamlandı")
    ).not.toBeInTheDocument();
  });

  it("geçerli rezervasyon durumunda onayı gösterir", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/success",
            state: {
              reservations: [
                {
                  id: 1,
                  resNo: "CS-123",
                  total: 440,
                  tickets: [{ id: 1 }, { id: 2 }],
                },
              ],
            },
          },
        ]}
      >
        <SuccessPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Rezervasyon tamamlandı",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Rezervasyon toplamı")
    ).toBeInTheDocument();
    expect(screen.getByText("CS-123")).toBeInTheDocument();
    expect(screen.getByText("440,00 TL")).toBeInTheDocument();
  });

  it("birden fazla rezervasyonun bilet ve tutarını toplar", () => {
    // Sepet birden fazla seans içerdiğinde backend seans başına bir
    // rezervasyon üretir; başarı ekranı hepsini birlikte özetler.
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/success",
            state: {
              reservations: [
                {
                  id: 1,
                  resNo: "CS-123",
                  total: 440,
                  tickets: [{ id: 1 }, { id: 2 }],
                },
                {
                  id: 2,
                  resNo: "CS-124",
                  total: 220,
                  tickets: [{ id: 3 }],
                },
              ],
            },
          },
        ]}
      >
        <SuccessPage />
      </MemoryRouter>
    );

    expect(screen.getByText("CS-123, CS-124")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("660,00 TL")).toBeInTheDocument();
  });

  it("eksik alanlı rezervasyon durumunu geçersiz sayar", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/success",
            state: { reservations: [{ id: 1 }] },
          },
        ]}
      >
        <SuccessPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", {
        name: "Rezervasyon bilgisi bulunamadı.",
      })
    ).toBeInTheDocument();
  });
});
