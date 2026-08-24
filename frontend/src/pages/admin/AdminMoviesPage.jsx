import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import movieService from '../../services/movieService';
import MoviePoster from '../../components/movies/MoviePoster.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function AdminMoviesPage() {
  const navigate = useNavigate();

  const {
    data: movies = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-movies"],
    queryFn: movieService.getMovies,
  });

  // NOT (Kişi 2 · Faz 2): confirm()/alert() çağrıları ConfirmDialog ve Toast
  // bileşenleriyle değiştirilecek; silme de T7 uyarınca arşivlemeye dönecek.
  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`"${title}" filmini silmek istediğinize emin misiniz?`);
    if (isConfirmed) {
      try {
        await movieService.deleteMovie(id);
        alert("Film başarıyla silindi.");
        refetch();
      } catch (error) {
        console.error("Silme işlemi başarısız oldu:", error);
        alert("Silme işlemi başarısız oldu.");
      }
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
      render: (movie) => (
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
            onClick={() => handleDelete(movie.id, movie.title)}
            className="admin-btn admin-btn-delete"
          >
            Sil
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-movies-page">
      <PageHeader
        title="🎬 Filmleri Yönet"
        description="Katalogdaki filmleri düzenleyin, yeni film ekleyin."
        actions={
          <Link to="/admin/movies/new" className="admin-btn admin-btn-primary">
            + Yeni Film Ekle
          </Link>
        }
      />

      <DataTable
        caption="Katalogdaki filmler"
        columns={columns}
        rows={movies}
        isLoading={isLoading}
        initialSort={{ key: "title", direction: "asc" }}
        emptyState={
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
        }
      />
    </div>
  );
}
