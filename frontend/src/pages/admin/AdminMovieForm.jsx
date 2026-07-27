import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import movieService from '../../services/movieService';

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
    poster: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);

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
          poster: data.poster,
          description: data.description
        });
      } catch (error) {
        console.error("Film bulunamadı:", error);
        alert("Film bulunamadı!");
        navigate('/admin/movies');
      } finally {
        setLoading(false);
      }
    };

    loadMovie(id);
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
        alert("Film başarıyla güncellendi!");
      } else {
        await movieService.addMovie(formData);
        alert("Film başarıyla eklendi!");
      }
      navigate('/admin/movies');
    } catch (error) {
      console.error("İşlem sırasında bir hata oluştu:", error);
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <p>Yükleniyor...</p>;

  return (
    <div className="admin-movie-form-page">
      <h2>{isEditMode ? 'Filmi Düzenle' : 'Yeni Film Ekle'}</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Film Adı *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tür *</label>
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Süre (Dk) *</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Yaş Sınırı *</label>
          <select name="ageRating" value={formData.ageRating} onChange={handleChange} required>
            <option value="Genel İzleyici">Genel İzleyici</option>
            <option value="7+">7+</option>
            <option value="13+">13+</option>
            <option value="16+">16+</option>
            <option value="18+">18+</option>
          </select>
        </div>

        <div className="form-group">
          <label>Çıkış Yılı *</label>
          <input
            type="number"
            name="releaseYear"
            value={formData.releaseYear}
            onChange={handleChange}
            min="1900"
            required
          />
        </div>

        <div className="form-group">
          <label>Vizyon Tarihi *</label>
          <input
            type="date"
            name="releaseDate"
            value={formData.releaseDate}
            onChange={handleChange}
            required
          />
          <small>Bugün veya geçmiş bir tarih girilirse film "Vizyonda" sekmesinde, ileri bir tarih girilirse "Yakında" sekmesinde görünür.</small>
        </div>

        <div className="form-group">
          <label>Afiş URL *</label>
          <input
            type="text"
            name="poster"
            value={formData.poster}
            onChange={handleChange}
            placeholder="/posters/ornek.png"
            required
          />
        </div>

        <div className="form-group">
          <label>Açıklama *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/movies')} className="admin-btn admin-btn-cancel">
            İptal
          </button>
          <button type="submit" disabled={loading} className="admin-btn admin-btn-save">
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
