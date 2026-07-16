import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import movieService from '../../services/movieService';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await movieService.getMovies();
      setMovies(data);
    } catch (error) {
      console.error("Filmler yüklenirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(`"${title}" filmini silmek istediğinize emin misiniz?`);
    if (isConfirmed) {
      try {
        await movieService.deleteMovie(id);
        alert("Film başarıyla silindi.");
        loadMovies(); // Listeyi yenile
      } catch (error) {
        alert("Silme işlemi başarısız oldu.");
      }
    }
  };

  return (
    <div className="admin-movies-page">
      <div className="admin-header">
        <h1>🎬 Filmleri Yönet</h1>
        <Link to="/admin/movies/new" className="admin-btn admin-btn-primary">
          + Yeni Film Ekle
        </Link>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Afiş</th>
              <th>Film Adı</th>
              <th>Tür</th>
              <th>Süre</th>
              <th>Yaş</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>
                  <img src={movie.poster} alt={movie.title} className="admin-table-poster" />
                </td>
                <td>{movie.title}</td>
                <td>{movie.genre}</td>
                <td>{movie.duration} dk</td>
                <td>{movie.ageRating}</td>
                <td className="admin-table-actions">
                  <button 
                    onClick={() => navigate(`/admin/movies/${movie.id}`)} 
                    className="admin-btn admin-btn-edit"
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={() => handleDelete(movie.id, movie.title)} 
                    className="admin-btn admin-btn-delete"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
