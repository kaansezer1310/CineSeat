import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import FormDialog from "../../components/ui/FormDialog.jsx";
import FormField from "../../components/ui/FormField.jsx";
import useToast from "../../hooks/useToast.js";
import movieService from "../../services/movieService.js";
import { cinemaResource } from "../../services/locationService.js";
import { hallResource } from "../../services/venueService.js";
import showtimeService, {
  SCREENING_FORMATS,
  getFormatLabel,
} from "../../services/showtimeService.js";

const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** `datetime-local` girdisi yerel saat bekler; ISO'dan ona çevirir. */
function toLocalInputValue(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value) => String(value).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function AdminShowtimesPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data: cinemas = [] } = useQuery({
    queryKey: ["admin", "cinemas"],
    queryFn: () => cinemaResource.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: movies = [] } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
  });

  const { data: halls = [] } = useQuery({
    queryKey: ["admin", "halls", selectedCinemaId],
    queryFn: () => hallResource.list({ cinemaId: selectedCinemaId }),
    enabled: Boolean(selectedCinemaId),
    staleTime: 60 * 1000,
  });

  const queryKey = ["admin", "showtimes", selectedCinemaId];

  const {
    data: showtimes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => showtimeService.listByCinema(selectedCinemaId),
    enabled: Boolean(selectedCinemaId),
    staleTime: 30 * 1000,
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey });
    // Müşteri tarafındaki seans listeleri de tazelensin.
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }

  const saveMutation = useMutation({
    mutationFn: (values) =>
      editing?.id
        ? showtimeService.update(editing.id, values)
        : showtimeService.create(values),
    onSuccess: () => {
      showSuccess(editing?.id ? "Seans güncellendi." : "Seans eklendi.");
      setEditing(null);
      setFormError("");
      refresh();
    },
    onError: (mutationError) => {
      // Çakışma (409) ve doğrulama (400) mesajları backend'den geliyor;
      // kullanıcı hangi seansla çakıştığını burada okuyor.
      setFormError(mutationError.message || "Seans kaydedilemedi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (showtime) => showtimeService.remove(showtime.id),
    onSuccess: () => {
      showSuccess("Seans kaldırıldı.");
      setPendingDelete(null);
      refresh();
    },
    onError: (mutationError) => {
      showError(mutationError.message || "Seans kaldırılamadı.");
      setPendingDelete(null);
    },
  });

  const movieTitleById = Object.fromEntries(
    movies.map((movie) => [movie.id, movie.title])
  );

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="🕐 Seanslar"
        description="Aynı salonda çakışan seans açılamaz; sunucu film süresi + 20 dk temizlik payına göre kontrol eder."
        actions={
          selectedCinemaId ? (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => {
                setFormError("");
                setEditing({});
              }}
            >
              + Seans Ekle
            </button>
          ) : null
        }
      />

      <div className="admin-filter-bar">
        <label htmlFor="showtime-cinema-filter">Sinema</label>
        <select
          id="showtime-cinema-filter"
          value={selectedCinemaId}
          onChange={(event) => setSelectedCinemaId(event.target.value)}
        >
          <option value="">Seçiniz…</option>
          {cinemas.map((cinema) => (
            <option key={cinema.id} value={cinema.id}>
              {cinema.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedCinemaId ? (
        <EmptyState
          icon="🏢"
          title="Önce bir sinema seçin"
          description="Seanslar seçilen sinemanın salonlarına göre listelenir."
        />
      ) : (
        <QueryState
          isLoading={isLoading}
          error={error}
          loadingText="Seanslar yükleniyor…"
          onRetry={refetch}
        >
          <DataTable
            caption="Seanslar"
            columns={[
              {
                key: "startDatetime",
                header: "Başlangıç",
                sortable: true,
                render: (showtime) =>
                  dateTimeFormatter.format(new Date(showtime.startDatetime)),
              },
              {
                key: "movie",
                header: "Film",
                sortable: true,
                sortValue: (showtime) =>
                  movieTitleById[showtime.movieId] ?? "",
                render: (showtime) =>
                  movieTitleById[showtime.movieId] ?? `#${showtime.movieId}`,
              },
              { key: "hallName", header: "Salon", sortable: true },
              {
                key: "format",
                header: "Format",
                render: (showtime) => getFormatLabel(showtime.format),
              },
              {
                key: "basePrice",
                header: "Fiyat",
                sortable: true,
                align: "right",
                render: (showtime) => `${showtime.basePrice.toFixed(2)} TL`,
              },
              {
                key: "actions",
                header: "İşlemler",
                render: (showtime) => (
                  <div className="admin-table-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-edit"
                      onClick={() => {
                        setFormError("");
                        setEditing(showtime);
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-delete"
                      onClick={() => setPendingDelete(showtime)}
                    >
                      Kaldır
                    </button>
                  </div>
                ),
              },
            ]}
            rows={showtimes}
            initialSort={{ key: "startDatetime", direction: "asc" }}
            emptyState={
              <EmptyState
                icon="🕐"
                title="Bu sinemada seans yok"
                description="Bilet satışının başlaması için en az bir seans gerekir."
              />
            }
          />
        </QueryState>
      )}

      <ShowtimeFormDialog
        editing={editing}
        movies={movies}
        halls={halls}
        formError={formError}
        isPending={saveMutation.isPending}
        onSubmit={(values) => saveMutation.mutate(values)}
        onCancel={() => {
          setEditing(null);
          setFormError("");
        }}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Seansı kaldır"
        description={
          pendingDelete
            ? `${dateTimeFormatter.format(
                new Date(pendingDelete.startDatetime)
              )} · ${pendingDelete.hallName} seansı kaldırılacak.`
            : ""
        }
        confirmLabel="Kaldır"
        variant="danger"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

const EMPTY_FORM = {
  movieId: "",
  hallId: "",
  startDatetime: "",
  basePrice: "",
  format: "Standard2D",
};

function ShowtimeFormDialog({
  editing,
  movies,
  halls,
  formError,
  isPending,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [previousEditing, setPreviousEditing] = useState(null);

  if (editing !== previousEditing) {
    setPreviousEditing(editing);
    setForm(
      editing?.id
        ? {
            movieId: String(editing.movieId),
            hallId: String(editing.hallId),
            startDatetime: toLocalInputValue(editing.startDatetime),
            basePrice: String(editing.basePrice),
            format: editing.format,
          }
        : EMPTY_FORM
    );
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const selectedMovie = movies.find(
    (movie) => String(movie.id) === form.movieId
  );

  return (
    <FormDialog
      isOpen={editing !== null}
      title={editing?.id ? "Seansı düzenle" : "Yeni seans"}
      description={
        selectedMovie
          ? `${selectedMovie.title} · ${selectedMovie.duration} dk`
          : undefined
      }
      isPending={isPending}
      error={formError}
      onSubmit={() => onSubmit(form)}
      onCancel={onCancel}
    >
      <FormField label="Film" required>
        {(fieldProps) => (
          <select
            {...fieldProps}
            value={form.movieId}
            onChange={(event) => update("movieId", event.target.value)}
            required
          >
            <option value="">Seçiniz…</option>
            {movies.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.title} ({movie.duration} dk)
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField label="Salon" required>
        {(fieldProps) => (
          <select
            {...fieldProps}
            value={form.hallId}
            onChange={(event) => update("hallId", event.target.value)}
            required
          >
            <option value="">Seçiniz…</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField
        label="Başlangıç"
        required
        hint="Seans gelecekte olmalı; aynı salondaki diğer seanslarla çakışamaz."
      >
        {(fieldProps) => (
          <input
            {...fieldProps}
            type="datetime-local"
            value={form.startDatetime}
            onChange={(event) => update("startDatetime", event.target.value)}
            required
          />
        )}
      </FormField>

      <div className="admin-form-row">
        <FormField label="Bilet fiyatı (TL)" required>
          {(fieldProps) => (
            <input
              {...fieldProps}
              type="number"
              min="1"
              step="0.01"
              value={form.basePrice}
              onChange={(event) => update("basePrice", event.target.value)}
              required
            />
          )}
        </FormField>

        <FormField label="Format" required>
          {(fieldProps) => (
            <select
              {...fieldProps}
              value={form.format}
              onChange={(event) => update("format", event.target.value)}
              required
            >
              {SCREENING_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>
    </FormDialog>
  );
}

export default AdminShowtimesPage;
