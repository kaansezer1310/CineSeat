import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DataTable from "./DataTable.jsx";
import EmptyState from "./EmptyState.jsx";

const columns = [
  { key: "title", header: "Film Adı", sortable: true },
  { key: "duration", header: "Süre", sortable: true, align: "right" },
  {
    key: "actions",
    header: "İşlemler",
    render: (row) => <button type="button">{row.title} düzenle</button>,
  },
];

const rows = [
  { id: 1, title: "Çığlık", duration: 120 },
  { id: 2, title: "Ada", duration: 95 },
  { id: 3, title: "Zümrüt", duration: 140 },
];

function readColumn(index) {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[index].textContent);
}

describe("DataTable", () => {
  it("satırları ve özel hücre içeriklerini render eder", () => {
    render(<DataTable columns={columns} rows={rows} />);

    expect(screen.getAllByRole("row")).toHaveLength(rows.length + 1);
    expect(
      screen.getByRole("button", { name: "Ada düzenle" })
    ).toBeInTheDocument();
  });

  it("başlığa tıklayınca artan, tekrar tıklayınca azalan sıralar", () => {
    render(<DataTable columns={columns} rows={rows} />);

    const sortButton = screen.getByRole("button", { name: /Film Adı/ });

    fireEvent.click(sortButton);
    expect(readColumn(0)).toEqual(["Ada", "Çığlık", "Zümrüt"]);

    fireEvent.click(sortButton);
    expect(readColumn(0)).toEqual(["Zümrüt", "Çığlık", "Ada"]);
  });

  it("üçüncü tıklamada sıralamayı kaldırıp kaynak sıraya döner", () => {
    render(<DataTable columns={columns} rows={rows} />);

    const sortButton = screen.getByRole("button", { name: /Film Adı/ });

    fireEvent.click(sortButton);
    fireEvent.click(sortButton);
    fireEvent.click(sortButton);

    expect(readColumn(0)).toEqual(["Çığlık", "Ada", "Zümrüt"]);
  });

  it("sayısal sütunu metin gibi değil sayı olarak sıralar", () => {
    render(<DataTable columns={columns} rows={rows} />);

    fireEvent.click(screen.getByRole("button", { name: /Süre/ }));

    expect(readColumn(1)).toEqual(["95", "120", "140"]);
  });

  it("sıralama durumunu aria-sort ile duyurur", () => {
    render(<DataTable columns={columns} rows={rows} />);

    const header = screen.getByRole("columnheader", { name: /Film Adı/ });
    expect(header).toHaveAttribute("aria-sort", "none");

    fireEvent.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  it("initialSort verilmişse ilk render'da uygular", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        initialSort={{ key: "title", direction: "asc" }}
      />
    );

    expect(readColumn(0)).toEqual(["Ada", "Çığlık", "Zümrüt"]);
  });

  it("kaynak diziyi yerinde sıralamaz", () => {
    const source = [...rows];

    render(
      <DataTable
        columns={columns}
        rows={source}
        initialSort={{ key: "title", direction: "asc" }}
      />
    );

    expect(source.map((row) => row.title)).toEqual([
      "Çığlık",
      "Ada",
      "Zümrüt",
    ]);
  });

  it("yükleniyorken iskelet satırları ve durum metni gösterir", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        isLoading
        skeletonRowCount={3}
      />
    );

    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Kayıtlar yükleniyor"
    );
  });

  it("liste boşsa verilen boş durumu gösterir, tablo render etmez", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        emptyState={<EmptyState title="Katalogda film yok" />}
      />
    );

    expect(screen.getByText("Katalogda film yok")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("boş durum verilmemişse varsayılan metni gösterir", () => {
    render(<DataTable columns={columns} rows={[]} />);

    expect(screen.getByText("Henüz kayıt yok")).toBeInTheDocument();
  });

  it("dar ekran kart görünümü için hücrelere başlık etiketi yazar", () => {
    render(<DataTable columns={columns} rows={rows} />);

    const firstDataRow = screen.getAllByRole("row")[1];
    const cells = within(firstDataRow).getAllByRole("cell");

    expect(cells[0]).toHaveAttribute("data-label", "Film Adı");
    expect(cells[1]).toHaveAttribute("data-label", "Süre");
  });
});
