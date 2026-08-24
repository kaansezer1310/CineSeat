import { useMemo, useState } from "react";

import EmptyState from "./EmptyState.jsx";

/**
 * Ortak veri tablosu: sıralama, yükleniyor iskeleti, boş durum ve dar
 * ekranda karta dönüşen görünüm.
 *
 * Dar ekran davranışı bilerek CSS ile çözülüyor: DOM tek bir <table>
 * olarak kalır (başlık-hücre ilişkisi ve ekran okuyucu desteği korunur),
 * `data-label` sayesinde hücreler kart satırı gibi görünür.
 *
 * Props:
 * - columns: [{ key, header, render?, sortable?, sortValue?, align?, className? }]
 *     render(row)     → hücre içeriği (verilmezse row[key])
 *     sortValue(row)  → sıralamada kullanılacak ham değer (verilmezse row[key])
 * - rows: object[]
 * - getRowKey: (row, index) => string | number
 * - isLoading: boolean — iskelet satırları gösterir
 * - skeletonRowCount: number — iskelet satır sayısı (varsayılan 4)
 * - caption: string — tabloya erişilebilir ad verir
 * - emptyState: node — boş liste yerine gösterilecek içerik
 * - initialSort: { key, direction: "asc" | "desc" }
 */
function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  // Türkçe karakterlerin doğru sıralanması için localeCompare("tr").
  return String(a).localeCompare(String(b), "tr", { numeric: true });
}

function DataTable({
  columns,
  rows,
  getRowKey = (row, index) => row?.id ?? index,
  isLoading = false,
  skeletonRowCount = 4,
  caption,
  emptyState,
  initialSort = null,
  className = "",
}) {
  const [sort, setSort] = useState(initialSort);

  const sortedRows = useMemo(() => {
    if (!sort) {
      return rows;
    }

    const column = columns.find((item) => item.key === sort.key);
    if (!column) {
      return rows;
    }

    const readValue =
      column.sortValue ?? ((row) => row[column.key]);

    // slice(): kaynak diziyi bozmadan sıralanmış kopya döner.
    return rows.slice().sort((rowA, rowB) => {
      const result = compareValues(readValue(rowA), readValue(rowB));
      return sort.direction === "desc" ? -result : result;
    });
  }, [rows, columns, sort]);

  function toggleSort(key) {
    setSort((current) => {
      if (current?.key !== key) {
        return { key, direction: "asc" };
      }

      return current.direction === "asc"
        ? { key, direction: "desc" }
        : null;
    });
  }

  function ariaSortFor(key) {
    if (sort?.key !== key) {
      return "none";
    }

    return sort.direction === "asc" ? "ascending" : "descending";
  }

  if (!isLoading && rows.length === 0) {
    return (
      emptyState ?? (
        <EmptyState
          title="Henüz kayıt yok"
          description="Bu listede gösterilecek bir kayıt bulunmuyor."
        />
      )
    );
  }

  return (
    <div className={`data-table-wrapper ${className}`.trim()}>
      <table className="data-table">
        {caption && <caption className="data-table-caption">{caption}</caption>}

        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.className}
                data-align={column.align}
                aria-sort={column.sortable ? ariaSortFor(column.key) : undefined}
              >
                {column.sortable ? (
                  <button
                    type="button"
                    className="data-table-sort-button"
                    onClick={() => toggleSort(column.key)}
                  >
                    {column.header}

                    <span className="data-table-sort-icon" aria-hidden="true">
                      {sort?.key === column.key
                        ? sort.direction === "asc"
                          ? "▲"
                          : "▼"
                        : "↕"}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="data-table-skeleton-row">
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.header}>
                      <span className="data-table-skeleton" aria-hidden="true" />
                    </td>
                  ))}
                </tr>
              ))
            : sortedRows.map((row, rowIndex) => (
                <tr key={getRowKey(row, rowIndex)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-label={column.header}
                      data-align={column.align}
                      className={column.className}
                    >
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>

      {isLoading && (
        <p className="data-table-loading-text" role="status">
          Kayıtlar yükleniyor…
        </p>
      )}
    </div>
  );
}

export default DataTable;
