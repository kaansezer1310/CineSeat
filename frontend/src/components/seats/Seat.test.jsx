import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { SEAT_STATUS } from "../../domain/seatStatus.js";
import Seat from "./Seat.jsx";

describe("Seat", () => {
  it("BOS durumunu seçilebilir ve tıklanabilir olarak render eder", () => {
    const handleSelect = vi.fn();

    render(
      <Seat
        seatId="A1"
        status={SEAT_STATUS.BOS}
        onSelect={handleSelect}
      />
    );

    const seatButton = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Boş/,
    });

    expect(seatButton).toBeEnabled();
    expect(seatButton).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(seatButton).toHaveClass("seat-status-bos");

    fireEvent.click(seatButton);

    expect(handleSelect).toHaveBeenCalledWith("A1");
  });

  it("SECILI durumunu basılı (pressed) ve tıklanabilir olarak render eder", () => {
    const handleSelect = vi.fn();

    render(
      <Seat
        seatId="A1"
        status={SEAT_STATUS.SECILI}
        onSelect={handleSelect}
      />
    );

    const seatButton = screen.getByRole("button", {
      name: /A1 numaralı koltuk, Seçili/,
    });

    expect(seatButton).toBeEnabled();
    expect(seatButton).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(seatButton).toHaveClass("seat-status-secili");

    fireEvent.click(seatButton);

    expect(handleSelect).toHaveBeenCalledWith("A1");
  });

  it("GECICI_KILITLI durumunda devre dışıdır ve tıklama seçim çağırmaz", () => {
    const handleSelect = vi.fn();

    render(
      <Seat
        seatId="B1"
        status={SEAT_STATUS.GECICI_KILITLI}
        onSelect={handleSelect}
      />
    );

    const seatButton = screen.getByRole("button", {
      name: /B1 numaralı koltuk, Geçici kilitli/,
    });

    expect(seatButton).toBeDisabled();
    expect(seatButton).toHaveClass(
      "seat-status-gecici-kilitli"
    );
    expect(seatButton).not.toHaveAttribute("aria-pressed");

    fireEvent.click(seatButton);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("DOLU durumunda devre dışıdır ve tıklama seçim çağırmaz", () => {
    const handleSelect = vi.fn();

    render(
      <Seat
        seatId="C1"
        status={SEAT_STATUS.DOLU}
        onSelect={handleSelect}
      />
    );

    const seatButton = screen.getByRole("button", {
      name: /C1 numaralı koltuk, Dolu/,
    });

    expect(seatButton).toBeDisabled();
    expect(seatButton).toHaveClass("seat-status-dolu");
    expect(seatButton).not.toHaveAttribute("aria-pressed");

    fireEvent.click(seatButton);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it("her koltuk native type=button düğmesi olarak render edilir", () => {
    render(
      <Seat
        seatId="D1"
        status={SEAT_STATUS.BOS}
        onSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", {
        name: /D1 numaralı koltuk/,
      })
    ).toHaveAttribute("type", "button");
  });
});
