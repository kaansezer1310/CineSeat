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
              reservation: {
                id: "CS-123",
                ticketCount: 2,
                totalPrice: 440,
              },
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
    expect(screen.getByText("440 TL")).toBeInTheDocument();
  });
});
