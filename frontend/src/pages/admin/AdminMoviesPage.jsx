import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import movieService from '../../services/movieService';
import MoviePoster from '../../components/movies/MoviePoster.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function AdminMoviesPage() {
  const navigate = useNavigate();

  // T7: kayıtlar kalıcı silinmiyor, arşivleniyor. Arşiv görünümü aynı
  // ekranda bir sekme; geri alma da buradan yapılır.
  const [showArchived, setShowArchived] = useState(false);

  const {
    data: movies = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: showArchived ? ["admin-movies", "archived"] : ["admin-movies"],
    queryFn: showArchived
      ? movieService.getArchivedMovies
      : movieService.getMovies,
  });

  // NOT (Kişi 2 · Faz 2): confirm()/alert() çağrıları ConfirmDialog ve Toast
  // bileşenleriyle değiştirilecek.
  const handleArchive = async (id, title) => {
    const isConfirmed = window.confirm(
      `"${title}" filmini arşivlemek istediğinize emin misiniz? Kayıt silinmez, arşivden geri alınabilir.`
    );

    if (isConfirmed) {
      try {
        await movieService.archiveMovie(id);
        alert("Film arşivlendi.");
        refetch();
      } catch (error) {
        console.error("Arşivleme başarısız oldu:", error);
        alert("Arşivleme başarısız oldu.");
      }
    }
  };

  const handleRestore = async (id) => {
    try {
      await movieService.restoreMovie(id);
      alert("Film arşivden geri alındı.");
      refetch();
    } catch (error) {
      console.error("Geri alma başarısız oldu:", error);
      alert("Geri alma başarısız oldu.");
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      align: "right",
    },
    {
      key: "poster",
      header: "Afiş",
      render: (movie) => (
        <MoviePoster movie={movie} className="admin-table-poster" />
      ),
    },
    {
      key: "title",
      header: "Film Adı",
      sortable: true,
    },
    {
      key: "genre",
      header: "Tür",
      sortable: true,
    },
    {
      key: "duration",
      header: "Süre",
      sortable: true,
      align: "right",
      render: (movie) => `${movie.duration} dk`,
    },
    {
      key: "ageRating",
      header: "Yaş",
      sortable: true,
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (movie) =>
        showArchived ? (
          <div className="admin-table-actions">
            <button
              type="button"
              onClick={() => handleRestore(movie.id)}
              className="admin-btn admin-btn-primary"
            >
              Geri Al
            </button>
          </div>
        ) : (
          <div className="admin-table-actions">
            <button
              type="button"
              onClick={() => navigate(`/admin/movies/${movie.id}`)}
              className="admin-btn admin-btn-edit"
            >
              Düzenle
            </button>

            <button
              type="button"
              onClick={() => handleArchive(movie.id, movie.title)}
              className="admin-btn admin-btn-delete"
            >
              Arşivle
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="admin-movies-page">
      <PageHeader
        title="🎬 Filmleri Yönet"
        description={
          showArchived
            ? "Arşivlenmiş filmler. Kayıtlar silinmez; buradan geri alınabilir."
            : "Katalogdaki filmleri düzenleyin, yeni film ekleyin."
        }
        actions={
          <>
            <button
              type="button"
              className="admin-btn admin-btn-cancel"
              onClick={() => setShowArchived((current) => !current)}
            >
              {showArchived ? "Katalogu Göster" : "Arşivi Göster"}
            </button>

            {!showArchived && (
              <Link
                to="/admin/movies/new"
                className="admin-btn admin-btn-primary"
              >
                + Yeni Film Ekle
              </Link>
            )}
          </>
        }
      />

      <DataTable
        caption={
          showArchived ? "Arşivlenmiş filmler" : "Katalogdaki filmler"
        }
        columns={columns}
        rows={movies}
        isLoading={isLoading}
        initialSort={{ key: "title", direction: "asc" }}
        emptyState={
          showArchived ? (
            <EmptyState
              icon="🗄️"
              title="Arşivde film yok"
              description="Arşivlediğiniz filmler burada listelenir."
            />
          ) : (
            <EmptyState
              icon="🎬"
              title="Katalogda henüz film yok"
              description="İlk filmi ekleyerek vizyon listesini oluşturabilirsiniz."
              action={
                <Link
                  to="/admin/movies/new"
                  className="admin-btn admin-btn-primary"
                >
                  + Yeni Film Ekle
                </Link>
              }
            />
          )
        }
      />
    </div>
  );
}
