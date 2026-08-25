import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import movieService from '../../services/movieService';
import PageHeader from '../../components/ui/PageHeader.jsx';
import StatusPanel from '../../components/ui/StatusPanel.jsx';
import useToast from '../../hooks/useToast.js';

const NUMERIC_FIELDS = new Set(["duration", "releaseYear"]);

export default function AdminMovieForm() {
  const { id } = useParams(); // URL'den ID'yi al
  const navigate = useNavigate();
  const isEditMode = Boolean(id); // ID varsa düzenleme modundayız

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    duration: "",
    ageRating: "Genel İzleyici",
    releaseYear: new Date().getFullYear(),
    releaseDate: "",
    screeningEndDate: "",
    poster: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadMovie = async (movieId) => {
      setLoading(true);
      try {
        const data = await movieService.getMovieById(movieId);
        setFormData({
          title: data.title,
          genre: data.genre,
          duration: data.duration,
          ageRating: data.ageRating,
          releaseYear: data.releaseYear,
          releaseDate: data.releaseDate ?? "",
          screeningEndDate: data.screeningEndDate ?? "",
          poster: data.poster,
          description: data.description
        });
      } catch (error) {
        showError(error.message || "Film bulunamadı.");
        navigate('/admin/movies');
      } finally {
        setLoading(false);
      }
    };

    loadMovie(id);
    // showError referansı ToastProvider'da memolu; bağımlılığa girmesi
    // effect'i yeniden tetiklemez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = NUMERIC_FIELDS.has(name) ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await movieService.updateMovie(id, formData);
        showSuccess("Film güncellendi.");
      } else {
        await movieService.addMovie(formData);
        showSuccess("Film eklendi.");
      }
      navigate('/admin/movies');
    } catch (error) {
      showError(error.message || "İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <StatusPanel variant="loading" title="Film bilgileri yükleniyor…" />;
  }

  return (
    <div className="admin-movie-form-page">
      <PageHeader
        title={isEditMode ? "Filmi Düzenle" : "Yeni Film Ekle"}
        description="Zorunlu alanlar yıldız (*) ile işaretlidir."
      />

      <form onSubmit={handleSubmit} className="admin-form">
        {/* İki sütunlu düzen: kısa alanlar yan yana, uzun metinler tam
            genişlikte (`form-group--wide`). Dar ekranda tek sütuna iner. */}
        <div className="admin-form-grid">
          <div className="form-group form-group--wide">
            <label htmlFor="movie-title">Film Adı *</label>
            <input
              id="movie-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="movie-genre">Tür *</label>
            <input
              id="movie-genre"
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="movie-duration">Süre (Dk) *</label>
            <input
              id="movie-duration"
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="movie-age-rating">Yaş Sınırı *</label>
            <select
              id="movie-age-rating"
              name="ageRating"
              value={formData.ageRating}
              onChange={handleChange}
              required
            >
              <option value="Genel İzleyici">Genel İzleyici</option>
              <option value="7+">7+</option>
              <option value="13+">13+</option>
              <option value="16+">16+</option>
              <option value="18+">18+</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="movie-release-year">Çıkış Yılı *</label>
            <input
              id="movie-release-year"
              type="number"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              min="1900"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="movie-release-date">Vizyon Tarihi *</label>
            <input
              id="movie-release-date"
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              aria-describedby="movie-release-date-hint"
              required
            />
            <small id="movie-release-date-hint">
              Bugün veya geçmiş bir tarih girilirse film &quot;Vizyonda&quot;
              sekmesinde, ileri bir tarih girilirse &quot;Yakında&quot;
              sekmesinde görünür.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="movie-screening-end-date">
              Vizyon Bitiş Tarihi *
            </label>
            <input
              id="movie-screening-end-date"
              type="date"
              name="screeningEndDate"
              value={formData.screeningEndDate}
              onChange={handleChange}
              aria-describedby="movie-screening-end-date-hint"
              required
            />
            <small id="movie-screening-end-date-hint">
              Bu tarihten sonra film arşive düşer, ana sayfada gösterilmez.
            </small>
          </div>

          <div className="form-group form-group--wide">
            <label htmlFor="movie-poster">Afiş URL *</label>
            <input
              id="movie-poster"
              type="text"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              placeholder="/posters/ornek.png"
              required
            />
          </div>

          <div className="form-group form-group--wide">
            <label htmlFor="movie-description">Açıklama *</label>
            <textarea
              id="movie-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="admin-btn admin-btn-cancel"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-save"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
