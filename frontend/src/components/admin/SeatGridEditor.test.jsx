import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../context/ToastProvider.jsx";
import { seatService } from "../../services/venueService.js";
import SeatGridEditor from "./SeatGridEditor.jsx";

vi.mock("../../services/venueService.js", () => ({
  seatService: {
    getSeatMap: vi.fn(),
    createGrid: vi.fn(),
    updateSeat: vi.fn(),
    removeSeat: vi.fn(),
  },
}));

function buildSeats() {
  const seats = [];
  let id = 1;

  for (let row = 1; row <= 2; row += 1) {
    for (let column = 1; column <= 3; column += 1) {
      seats.push({
        id: id++,
        row,
        column,
        type: "Regular",
        isActive: !(row === 2 && column === 3),
      });
    }
  }

  return seats;
}

function renderEditor() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SeatGridEditor hallId={5} hallName="Salon 1" />
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe("SeatGridEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seatService.getSeatMap.mockResolvedValue(buildSeats());
    seatService.updateSeat.mockResolvedValue(null);
    seatService.createGrid.mockResolvedValue(null);
  });

  it("koltukları etiketleriyle çizer", async () => {
    renderEditor();

    expect(
      await screen.findByRole("button", { name: /^A1 koltuğu/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^B3 koltuğu/ })
    ).toBeInTheDocument();
  });

  it("kullanım dışı koltuğu erişilebilir adında belirtir", async () => {
    renderEditor();

    expect(
      await screen.findByRole("button", {
        name: /B3 koltuğu.*kullanım dışı/,
      })
    ).toBeInTheDocument();
  });

  it("koltuk yoksa ızgara oluşturma formu sunar", async () => {
    seatService.getSeatMap.mockResolvedValue([]);

    renderEditor();

    expect(
      await screen.findByText("Salon 1 salonunda koltuk yok")
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Satır"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Sütun"), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Planı Oluştur" }));

    await waitFor(() => {
      expect(seatService.createGrid).toHaveBeenCalledWith({
        hallId: 5,
        rowCount: "5",
        columnCount: "7",
      });
    });
  });

  it("koltuğa tıklayınca düzenleme paneli açılır", async () => {
    renderEditor();

    fireEvent.click(
      await screen.findByRole("button", { name: /^A1 koltuğu/ })
    );

    expect(
      screen.getByRole("heading", { name: "A1 koltuğu" })
    ).toBeInTheDocument();
  });

  it("koltuk tipini değiştirir", async () => {
    renderEditor();

    fireEvent.click(
      await screen.findByRole("button", { name: /^A1 koltuğu/ })
    );
    fireEvent.change(screen.getByLabelText("Tip"), {
      target: { value: "VIP" },
    });

    await waitFor(() => {
      expect(seatService.updateSeat).toHaveBeenCalledWith(1, {
        type: "VIP",
        isActive: true,
      });
    });
  });

  it("koltuğu kullanım dışı bırakır", async () => {
    renderEditor();

    fireEvent.click(
      await screen.findByRole("button", { name: /^A1 koltuğu/ })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Kullanım dışı bırak" })
    );

    await waitFor(() => {
      expect(seatService.updateSeat).toHaveBeenCalledWith(1, {
        type: "Regular",
        isActive: false,
      });
    });
  });
});
