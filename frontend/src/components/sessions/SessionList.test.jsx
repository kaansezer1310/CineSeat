import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SessionList from "./SessionList.jsx";

const SESSIONS = [
  { id: 1, date: "13 Temmuz", time: "14:00", hallName: "Salon 1", price: 120 },
  { id: 2, date: "13 Temmuz", time: "18:00", hallName: "Salon 2", price: 140 },
  { id: 3, date: "14 Temmuz", time: "20:00", hallName: "Salon 1", price: 120 },
];

describe("SessionList", () => {
  it("seans yoksa boş durum mesajı gösterir", () => {
    render(<SessionList sessions={[]} onSessionSelect={vi.fn()} />);

    expect(
      screen.getByText("Bu filme ait aktif seans bulunmuyor.")
    ).toBeInTheDocument();
  });

  it("varsayılan olarak ilk tarihi seçili gösterir ve o tarihin seanslarını listeler", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    expect(
      screen.getByRole("tab", { name: "13 Temmuz" })
    ).toHaveAttribute("aria-selected", "true");

    expect(screen.getByText("14:00")).toBeInTheDocument();
    expect(screen.getByText("18:00")).toBeInTheDocument();
    expect(screen.queryByText("20:00")).not.toBeInTheDocument();
  });

  it("başka bir tarihe tıklanınca o tarihin seansları gösterilir", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "14 Temmuz" }));

    expect(
      screen.getByRole("tab", { name: "14 Temmuz" })
    ).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("tab", { name: "13 Temmuz" })
    ).toHaveAttribute("aria-selected", "false");

    expect(screen.getByText("20:00")).toBeInTheDocument();
    expect(screen.queryByText("14:00")).not.toBeInTheDocument();
  });

  it("tekrarlanan tarihleri yalnızca bir kez tarih sekmesi olarak gösterir", () => {
    render(<SessionList sessions={SESSIONS} onSessionSelect={vi.fn()} />);

    expect(screen.getAllByRole("tab")).toHaveLength(2);
  });

  it("bir seansa tıklanınca onSessionSelect id ile çağrılır", () => {
    const handleSelect = vi.fn();
    render(
      <SessionList sessions={SESSIONS} onSessionSelect={handleSelect} />
    );

    fireEvent.click(screen.getByText("14:00").closest("button"));

    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
