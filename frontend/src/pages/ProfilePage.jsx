import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth.js";
import useWatchlist from "../hooks/useWatchlist.js";
import movieService from "../services/movieService.js";
import reservationService from "../services/reservationService.js";
import profileService from "../services/profileService.js";
import sessionService from "../services/sessionService.js";
import { validateRegisterForm } from "../services/validation.js";

/**
 * Sprint 3 — Profil sayfası
 * 1.2.5: Kişisel bilgi formu (REQ-18)
 * 1.2.6: Bilet sekmeleri — güncel ve geçmiş (REQ-18)
 * 1.2.8: İzleme listem sekmesi + bildirim (REQ-25)
 */

const PROFILE_TABS = [
  { id: "info", label: "Bilgilerim" },
  { id: "tickets", label: "Biletlerim" },
  { id: "watchlist", label: "İzleme Listem" },
];

function ProfilePage() {
  const { user } = useAuth();
  const { getFavoriteMovieIds, toggleFavorite } = useWatchlist();

  const [activeTab, setActiveTab] = useState("info");

  // === BİLGİLERİM sekmesi ===
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    password: "",
    passwordConfirm: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [saveMessage, setSaveMessage] = useState("");

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedProfile) => {
      // Oturumdaki kullanıcıyı da tazele; token aynı kalır.
      const stored = JSON.parse(
        sessionStorage.getItem("cineseat_user") ?? "{}"
      );

      sessionStorage.setItem(
        "cineseat_user",
        JSON.stringify({ ...stored, ...updatedProfile })
      );

      setSaveMessage("Bilgileriniz başarıyla güncellendi.");
      setFormErrors({});
      setEditMode(false);
      setTimeout(() => setSaveMessage(""), 3000);
    },
    onError: (error) => {
      setFormErrors({ general: error.message });
    },
  });

  const handleSave = () => {
    // Şifre alanları boşsa doğrulamadan muaf tut (değiştirmek istemiyor).
    // Not: şifre değişimi backend'de ayrı bir akış — bu form yalnızca ad,
    // soyad, telefon ve cinsiyeti günceller.
    const dataToValidate = { ...formData };
    if (!dataToValidate.password && !dataToValidate.passwordConfirm) {
      dataToValidate.password = "SKIP01"; // geçici — validate'ten geçmesi için
      dataToValidate.passwordConfirm = "SKIP01";
    }
    const errors = validateRegisterForm(dataToValidate);
    if (!formData.password && !formData.passwordConfirm) {
      delete errors.password;
      delete errors.passwordConfirm;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    updateProfileMutation.mutate({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
    });
  };

  // === BİLETLERİM sekmesi ===
  // Kullanıcının KENDİ rezervasyonları (GET /api/reservations/my). Önceden
  // localStorage'dan okunuyordu: başka bir tarayıcıdan girildiğinde liste
  // boş görünüyordu.
  const { data: reservationPage } = useQuery({
    queryKey: ["myReservations"],
    queryFn: () => reservationService.getMyReservations(),
    enabled: Boolean(user),
    staleTime: 30 * 1000,
  });

  const reservations = reservationPage?.items ?? [];

  // REQ-18: "Güncel" / "Geçmiş" ayrımı gösterim saatine göre yapılır —
  // rezervasyonun ne zaman satın alındığına değil. Backend seans başlangıcını
  // ISO tarih olarak döndürdüğü için yıl tahmini gerekmiyor.
  const isUpcoming = (reservation) =>
    !sessionService.isShowtimeInPast(reservation);

  const currentTickets = reservations.filter(isUpcoming);
  const pastTickets = reservations.filter(
    (reservation) => !isUpcoming(reservation)
  );

  // === İZLEME LİSTEM sekmesi ===
  const favoriteIds = getFavoriteMovieIds();

  const { data: allMovies = [] } = useQuery({
    queryKey: ["movies"],
    queryFn: movieService.getMovies,
    staleTime: 5 * 60 * 1000,
  });

  const favoriteMovies = allMovies.filter((m) => favoriteIds.includes(m.id));

  return (
    <section>
      <div className="page-heading">
        <h1>Profilim</h1>
        <p>Hoşgeldin, {user?.name}</p>
      </div>

      {/* Sekme navigasyonu */}
      <div className="movie-tab-list" role="tablist">
        {PROFILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={
                isActive
                  ? "movie-tab-button movie-tab-button-active"
                  : "movie-tab-button"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "watchlist" && favoriteIds.length > 0 && (
                <span className="profile-tab-badge">{favoriteIds.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* BİLGİLERİM */}
      {activeTab === "info" && (
        <div className="profile-panel">
          {saveMessage && (
            <div className="auth-success" role="status">
              {saveMessage}
            </div>
          )}

          <div className="auth-form">
            <div className="auth-row">
              <div className="auth-field">
                <label>Ad</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
                {formErrors.firstName && <span className="auth-field-error">{formErrors.firstName}</span>}
              </div>
              <div className="auth-field">
                <label>Soyad</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
                {formErrors.lastName && <span className="auth-field-error">{formErrors.lastName}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label>E-posta</label>
              <input type="email" value={formData.email} disabled />
            </div>

            <div className="auth-field">
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                disabled={!editMode}
              />
              {formErrors.username && <span className="auth-field-error">{formErrors.username}</span>}
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label>Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </div>
              <div className="auth-field">
                <label>Cinsiyet</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  disabled={!editMode}
                >
                  <option value="">Belirtmek istemiyorum</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                  <option value="other">Diğer</option>
                </select>
              </div>
            </div>

            <div className="profile-form-actions">
              {editMode ? (
                <>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleSave}
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setEditMode(false);
                      setFormErrors({});
                    }}
                  >
                    İptal
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setEditMode(true)}
                >
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BİLETLERİM */}
      {activeTab === "tickets" && (
        <div className="profile-panel">
          <h2 className="profile-section-title">Güncel Biletler</h2>
          {currentTickets.length === 0 ? (
            <div className="temporary-panel">Güncel biletiniz bulunmuyor.</div>
          ) : (
            <div className="profile-ticket-list">
              {currentTickets.map((r) => (
                <div key={r.id} className="profile-ticket-card">
                  <div className="profile-ticket-header">
                    <strong>{r.resNo}</strong>
                    <span>
                      {new Date(r.startDatetime).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="profile-ticket-body">
                    <span>{r.movieTitle}</span>
                    <span>{r.ticketCount} bilet</span>
                    <span>{r.total.toFixed(2)} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="profile-section-title profile-section-title--spaced">
            Geçmiş Biletler
          </h2>
          {pastTickets.length === 0 ? (
            <div className="temporary-panel">Geçmiş biletiniz bulunmuyor.</div>
          ) : (
            <div className="profile-ticket-list">
              {pastTickets.map((r) => (
                <div key={r.id} className="profile-ticket-card profile-ticket-past">
                  <div className="profile-ticket-header">
                    <strong>{r.resNo}</strong>
                    <span>
                      {new Date(r.startDatetime).toLocaleString("tr-TR")}
                    </span>
                  </div>
                  <div className="profile-ticket-body">
                    <span>{r.movieTitle}</span>
                    <span>{r.ticketCount} bilet</span>
                    <span>{r.total.toFixed(2)} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* İZLEME LİSTEM */}
      {activeTab === "watchlist" && (
        <div className="profile-panel">
          {favoriteMovies.length === 0 ? (
            <div className="temporary-panel">
              İzleme listeniz boş. Film kartlarındaki ♡ ikonuna tıklayarak favori ekleyebilirsiniz.
            </div>
          ) : (
            <div className="profile-watchlist-grid">
              {favoriteMovies.map((movie) => {
                const daysLeft = movieService.getDaysUntilRelease(movie);
                const isReleased = movieService.isMovieReleased(movie);

                return (
                  <div key={movie.id} className="profile-watchlist-item">
                    <div className="profile-watchlist-poster">
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} />
                      ) : (
                        <div className="profile-watchlist-no-poster">Afis yok</div>
                      )}
                    </div>
                    <div className="profile-watchlist-info">
                      <strong>{movie.title}</strong>
                      {isReleased ? (
                        <span className="profile-watchlist-badge profile-watchlist-badge--active">
                          Vizyonda
                        </span>
                      ) : (
                        <span className="profile-watchlist-badge">
                          {daysLeft > 0 ? `${daysLeft} gün kaldı` : "Bugün vizyonda"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="profile-watchlist-remove"
                      onClick={() => toggleFavorite(movie.id)}
                      title="İzleme listesinden çıkar"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ProfilePage;
