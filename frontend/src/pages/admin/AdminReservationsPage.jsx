import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import reservationService from "../../services/reservationService.js";
import movieService from "../../services/movieService.js";

// Backend `ReservationStatus` enum'u (ad olarak taşınır).
const STATUSES = [
  { value: "", label: "Tümü" },
  { value: "Pending", label: "Bekliyor" },
  { value: "Completed", label: "Tamamlandı" },
  { value: "Cancelled", label: "İptal" },
];

const STATUS_LABELS = {
  Pending: "Bekliyor",
  Completed: "Tamamlandı",
  Cancelled: "İptal",
};

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Tüm rezervasyonlar — `reservation.read` izni gerektirir (T3).
 *
 * Filtreler sunucuya gidiyor: sayfa 100'lük dilimler hâlinde okuduğu için
 * istemci tarafında süzmek eksik sonuç verirdi.
 */
function AdminReservationsPage() {
  const [filters, setFilters] = useState({
    status: "",
    movieId: "",
    from: "",
    to: "",
  });

  const { data: movies = [] } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "reservations", filters],
    queryFn: () =>
      reservationService.getAllReservations({
        status: filters.status || undefined,
        movieId: filters.movieId || undefined,
        // `date` girdisi gün veriyor; sunucu seans başlangıcına göre süzüyor.
        from: filters.from ? `${filters.from}T00:00:00Z` : undefined,
        to: filters.to ? `${filters.to}T23:59:59Z` : undefined,
      }),
    staleTime: 30 * 1000,
  });

  const reservations = data?.items ?? [];

  // Özet, filtrelenmiş kümeyi anlatır: "şu tarihte şu filmden kaç bilet".
  const ticketCount = reservations.reduce(
    (total, item) => total + item.ticketCount,
    0
  );
  const revenue = reservations
    .filter((item) => item.status !== "Cancelled")
    .reduce((total, item) => total + item.total, 0);

  function update(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="🎫 Rezervasyonlar"
        description="Filtreler sunucuya gönderilir; özet aşağıdaki filtrelenmiş kümeyi anlatır."
      />

      <div className="admin-filter-bar">
        <label htmlFor="reservation-status">Durum</label>
        <select
          id="reservation-status"
          value={filters.status}
          onChange={(event) => update("status", event.target.value)}
        >
          {STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <label htmlFor="reservation-movie">Film</label>
        <select
          id="reservation-movie"
          value={filters.movieId}
          onChange={(event) => update("movieId", event.target.value)}
        >
          <option value="">Tümü</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>

        <label htmlFor="reservation-from">Başlangıç</label>
        <input
          id="reservation-from"
          type="date"
          value={filters.from}
          onChange={(event) => update("from", event.target.value)}
        />

        <label htmlFor="reservation-to">Bitiş</label>
        <input
          id="reservation-to"
          type="date"
          value={filters.to}
          onChange={(event) => update("to", event.target.value)}
        />

        <button
          type="button"
          className="admin-btn admin-btn-cancel"
          onClick={() =>
            setFilters({ status: "", movieId: "", from: "", to: "" })
          }
        >
          Filtreleri Temizle
        </button>
      </div>

      <div className="admin-stats-cards">
        <StatCard
          label="Rezervasyon"
          value={data?.totalCount ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          label="Bilet"
          value={ticketCount}
          suffix="Adet"
          isLoading={isLoading}
        />
        <StatCard
          label="Ciro (iptaller hariç)"
          value={revenue.toLocaleString("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          suffix="TL"
          isLoading={isLoading}
        />
      </div>

      <QueryState
        isLoading={isLoading}
        error={error}
        loadingText="Rezervasyonlar yükleniyor…"
        onRetry={refetch}
      >
        <DataTable
          caption="Rezervasyonlar"
          columns={[
            { key: "resNo", header: "Rez. No", sortable: true },
            { key: "movieTitle", header: "Film", sortable: true },
            {
              key: "startDatetime",
              header: "Seans",
              sortable: true,
              render: (reservation) =>
                dateTimeFormatter.format(new Date(reservation.startDatetime)),
            },
            {
              key: "ticketCount",
              header: "Bilet",
              align: "right",
              sortable: true,
            },
            {
              key: "total",
              header: "Tutar",
              align: "right",
              sortable: true,
              render: (reservation) => `${reservation.total.toFixed(2)} TL`,
            },
            {
              key: "status",
              header: "Durum",
              render: (reservation) => (
                <span
                  className={
                    reservation.status === "Completed"
                      ? "status-badge status-badge-on"
                      : reservation.status === "Cancelled"
                        ? "status-badge status-badge-off"
                        : "status-badge"
                  }
                >
                  {STATUS_LABELS[reservation.status] ?? reservation.status}
                </span>
              ),
            },
          ]}
          rows={reservations}
          initialSort={{ key: "startDatetime", direction: "desc" }}
          emptyState={
            <EmptyState
              icon="🎫"
              title="Bu filtrelerle rezervasyon yok"
              description="Filtreleri gevşetip tekrar deneyin."
            />
          }
        />
      </QueryState>
    </div>
  );
}

export default AdminReservationsPage;
