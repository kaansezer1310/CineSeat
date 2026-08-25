import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import QueryState from "../../components/ui/QueryState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import useToast from "../../hooks/useToast.js";
import commentService from "../../services/commentService.js";
import movieService from "../../services/movieService.js";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Yorum moderasyonu.
 *
 * Backend yorumları yalnızca film kırılımında veriyor (`GET /comments?movieId=`);
 * düz bir "tüm yorumlar" ucu yok. Bu yüzden ekran filmleri gezip yorumlarını
 * paralel çekiyor ve tek listede birleştiriyor — moderatörün film film
 * dolaşması gerekmesin diye.
 */
function AdminCommentsPage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const [pendingDelete, setPendingDelete] = useState(null);
  const [movieFilter, setMovieFilter] = useState("");

  const { data: movies = [], isLoading: areMoviesLoading } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
  });

  const targetMovies = movieFilter
    ? movies.filter((movie) => String(movie.id) === movieFilter)
    : movies;

  const commentQueries = useQueries({
    queries: targetMovies.map((movie) => ({
      queryKey: ["comments", movie.id],
      queryFn: () => commentService.getCommentsByMovieId(movie.id),
      staleTime: 30 * 1000,
    })),
  });

  const isLoading = areMoviesLoading || commentQueries.some((q) => q.isLoading);
  const error = commentQueries.find((q) => q.error)?.error ?? null;

  const comments = commentQueries.flatMap((query, index) =>
    (query.data ?? []).map((comment) => ({
      ...comment,
      movieTitle: targetMovies[index]?.title ?? `#${comment.movieId}`,
    }))
  );

  const deleteMutation = useMutation({
    mutationFn: (comment) => commentService.deleteComment(comment.id),
    onSuccess: (_result, comment) => {
      showSuccess("Yorum kaldırıldı.");
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["comments", comment.movieId] });
      // Ortalama puan film kaydında tutuluyor, yorum silinince değişir.
      queryClient.invalidateQueries({ queryKey: ["admin-movies"] });
    },
    onError: (mutationError) => {
      showError(mutationError.message || "Yorum kaldırılamadı.");
      setPendingDelete(null);
    },
  });

  return (
    <div className="admin-crud-page">
      <PageHeader
        title="Yorum Moderasyonu"
        description="Kaldırılan yorum geri getirilemez ve filmin puan ortalaması yeniden hesaplanır."
      />

      <div className="admin-filter-bar">
        <label htmlFor="comment-movie-filter">Film</label>
        <select
          id="comment-movie-filter"
          value={movieFilter}
          onChange={(event) => setMovieFilter(event.target.value)}
        >
          <option value="">Tüm filmler</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.title}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        isLoading={isLoading}
        error={error}
        loadingText="Yorumlar yükleniyor…"
      >
        <DataTable
          caption="Yorumlar"
          columns={[
            { key: "userName", header: "Kullanıcı", sortable: true },
            { key: "movieTitle", header: "Film", sortable: true },
            {
              key: "rating",
              header: "Puan",
              align: "right",
              sortable: true,
              render: (comment) => `${comment.rating} / 5`,
            },
            {
              key: "text",
              header: "Yorum",
              render: (comment) =>
                comment.text ? (
                  <span className="comment-cell">{comment.text}</span>
                ) : (
                  <span className="comment-cell comment-cell-empty">
                    Yalnızca puan verilmiş
                  </span>
                ),
            },
            {
              key: "createdAt",
              header: "Tarih",
              sortable: true,
              render: (comment) =>
                dateFormatter.format(new Date(comment.createdAt)),
            },
            {
              key: "actions",
              header: "İşlemler",
              render: (comment) => (
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn-delete"
                    onClick={() => setPendingDelete(comment)}
                  >
                    Kaldır
                  </button>
                </div>
              ),
            },
          ]}
          rows={comments}
          getRowKey={(comment) => comment.id}
          initialSort={{ key: "createdAt", direction: "desc" }}
          emptyState={
            <EmptyState
              title="Yorum yok"
              description="Kullanıcılar puan verdikçe burada listelenir."
            />
          }
        />
      </QueryState>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Yorumu kaldır"
        description={
          pendingDelete
            ? `${pendingDelete.userName} kullanıcısının "${pendingDelete.movieTitle}" filmine yaptığı değerlendirme kalıcı olarak silinecek.`
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

export default AdminCommentsPage;
