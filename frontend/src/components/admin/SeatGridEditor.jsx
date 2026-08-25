import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { formatSeatLabel } from "../../domain/seat.js";
import { seatService } from "../../services/venueService.js";
import useToast from "../../hooks/useToast.js";
import StatusPanel from "../ui/StatusPanel.jsx";
import EmptyState from "../ui/EmptyState.jsx";

// Backend SeatType enum'u (JsonStringEnumConverter ile ad olarak taşınır).
const SEAT_TYPES = [
  { value: "Regular", label: "Standart" },
  { value: "VIP", label: "VIP" },
  { value: "Disabled", label: "Engelli" },
  { value: "LoveSeat", label: "Çift kişilik" },
];

/**
 * Salonun koltuk planını düzenler.
 *
 * Koltuklar tek tek eklenmiyor: salon için ızgara halinde toplu üretiliyor
 * (`POST /seats/bulk`). Sonrasında her koltuğun tipi ve kullanılabilirliği
 * ayrı ayrı değiştirilebiliyor — bir koltuğun önüne kolon geldiğinde tüm
 * planı yeniden üretmek gerekmesin diye.
 */
function SeatGridEditor({ hallId, hallName }) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [gridForm, setGridForm] = useState({ rowCount: 8, columnCount: 10 });

  const queryKey = ["admin", "seats", hallId];

  const { data: seats = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => seatService.getSeatMap(hallId),
    enabled: Boolean(hallId),
    staleTime: 30 * 1000,
  });

  const createGridMutation = useMutation({
    mutationFn: () =>
      seatService.createGrid({
        hallId,
        rowCount: gridForm.rowCount,
        columnCount: gridForm.columnCount,
      }),
    onSuccess: () => {
      showSuccess("Koltuk planı oluşturuldu.");
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (mutationError) =>
      showError(mutationError.message || "Koltuk planı oluşturulamadı."),
  });

  const updateSeatMutation = useMutation({
    mutationFn: ({ seatId, changes }) =>
      seatService.updateSeat(seatId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setSelectedSeat(null);
    },
    onError: (mutationError) =>
      showError(mutationError.message || "Koltuk güncellenemedi."),
  });

  if (isLoading) {
    return <StatusPanel variant="loading" title="Koltuk planı yükleniyor…" />;
  }

  if (error) {
    return (
      <StatusPanel
        variant={error.status === 403 ? "forbidden" : "error"}
        title="Koltuk planı alınamadı"
        description={error.message}
      />
    );
  }

  if (seats.length === 0) {
    return (
      <div className="seat-editor">
        <EmptyState
          title={`${hallName} salonunda koltuk yok`}
          description="Satır ve sütun sayısını girip planı tek seferde oluşturun."
        />

        <form
          className="seat-editor-grid-form"
          onSubmit={(event) => {
            event.preventDefault();
            createGridMutation.mutate();
          }}
        >
          <label htmlFor="seat-grid-rows">Satır</label>
          <input
            id="seat-grid-rows"
            type="number"
            min="1"
            max="26"
            value={gridForm.rowCount}
            onChange={(event) =>
              setGridForm((f) => ({ ...f, rowCount: event.target.value }))
            }
            required
          />

          <label htmlFor="seat-grid-columns">Sütun</label>
          <input
            id="seat-grid-columns"
            type="number"
            min="1"
            max="40"
            value={gridForm.columnCount}
            onChange={(event) =>
              setGridForm((f) => ({ ...f, columnCount: event.target.value }))
            }
            required
          />

          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={createGridMutation.isPending}
          >
            {createGridMutation.isPending ? "Oluşturuluyor…" : "Planı Oluştur"}
          </button>
        </form>
      </div>
    );
  }

  const columnCount = seats.reduce(
    (max, seat) => Math.max(max, seat.column),
    0
  );

  return (
    <div className="seat-editor">
      <p className="seat-editor-hint">
        Bir koltuğa tıklayarak tipini değiştirebilir veya kullanım dışı
        bırakabilirsiniz. Kullanım dışı koltuklar satışa açılmaz.
      </p>

      <div
        className="seat-editor-grid"
        style={{ "--seat-columns": columnCount }}
      >
        {seats.map((seat) => (
          <button
            key={seat.id}
            type="button"
            className={[
              "seat-editor-seat",
              `seat-editor-seat-${seat.type.toLowerCase()}`,
              seat.isActive ? "" : "seat-editor-seat-inactive",
              selectedSeat?.id === seat.id ? "seat-editor-seat-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--seat-row": seat.row, "--seat-column": seat.column }}
            onClick={() => setSelectedSeat(seat)}
            aria-pressed={selectedSeat?.id === seat.id}
            aria-label={`${formatSeatLabel(seat.row, seat.column)} koltuğu, ${
              SEAT_TYPES.find((t) => t.value === seat.type)?.label ?? seat.type
            }${seat.isActive ? "" : ", kullanım dışı"}`}
          >
            {formatSeatLabel(seat.row, seat.column)}
          </button>
        ))}
      </div>

      {selectedSeat && (
        <div className="seat-editor-panel">
          <h4>
            {formatSeatLabel(selectedSeat.row, selectedSeat.column)} koltuğu
          </h4>

          <div className="seat-editor-panel-controls">
            <label htmlFor="seat-editor-type">Tip</label>
            <select
              id="seat-editor-type"
              value={selectedSeat.type}
              onChange={(event) =>
                updateSeatMutation.mutate({
                  seatId: selectedSeat.id,
                  changes: {
                    type: event.target.value,
                    isActive: selectedSeat.isActive,
                  },
                })
              }
            >
              {SEAT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              disabled={updateSeatMutation.isPending}
              onClick={() =>
                updateSeatMutation.mutate({
                  seatId: selectedSeat.id,
                  changes: {
                    type: selectedSeat.type,
                    isActive: !selectedSeat.isActive,
                  },
                })
              }
            >
              {selectedSeat.isActive ? "Kullanım dışı bırak" : "Kullanıma aç"}
            </button>

            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              onClick={() => setSelectedSeat(null)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeatGridEditor;
