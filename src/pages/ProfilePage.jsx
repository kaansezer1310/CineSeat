import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth.js";
import useWatchlist from "../hooks/useWatchlist.js";
import movieService from "../services/movieService.js";
import reservationService from "../services/reservationService.js";
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

  const handleSave = () => {
    // Şifre alanları boşsa doğrulamadan muaf tut (değiştirmek istemiyor)
    const dataToValidate = { ...formData };
    if (!dataToValidate.password && !dataToValidate.passwordConfirm) {
      dataToValidate.password = "SKIP01"; // geçici — validate'ten geçmesi için
      dataToValidate.passwordConfirm = "SKIP01";
    }
    const errors = validateRegisterForm(dataToValidate);
    // Şifre skip'leniyorsa hataları kaldır
    if (!formData.password && !formData.passwordConfirm) {
      delete errors.password;
      delete errors.passwordConfirm;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Mock güncelleme — sessionStorage'daki user'ı güncelle
    const updatedUser = {
      ...user,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      username: formData.username.trim(),
      phone: formData.phone.trim(),
      gender: formData.gender,
    };
    sessionStorage.setItem("cineseat_user", JSON.stringify(updatedUser));
    setSaveMessage("Bilgileriniz başarıyla güncellendi.");
    setEditMode(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  // === BİLETLERİM sekmesi ===
  const { data: reservations = [] } = useQuery({
    queryKey: ["reservations"],
    queryFn: reservationService.getAllReservations,
    staleTime: 30 * 1000,
  });

  // REQ-18: "Güncel" / "Geçmiş" ayrımı gösterim saatine göre yapılır —
  // rezervasyonun ne zaman satın alındığına değil. Bir rezervasyon birden
  // fazla seans içerebilir; en az bir seansı henüz geçmemişse "Güncel"
  // sayılır (kullanıcının hâlâ gideceği bir gösterim var demektir).
  const reservationHasUpcomingSession = (reservation) => {
    return reservation.items.some((item) => {
      return !sessionService.hasSessionPassed(item.date, item.time);
    });
  };

  const currentTickets = reservations.filter(
    reservationHasUpcomingSession
  );
  const pastTickets = reservations.filter(
    (r) => !reservationHasUpcomingSession(r)
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
            <div className="auth-error" style={{ borderColor: "var(--color-success)", background: "rgba(113, 148, 124, 0.1)", color: "var(--color-success)" }} role="status">
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

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
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
                    <strong>{r.id}</strong>
                    <span>{new Date(r.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="profile-ticket-body">
                    <span>{r.ticketCount} bilet</span>
                    <span>{r.totalPrice?.toFixed(2)} ₺</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="profile-section-title" style={{ marginTop: "32px" }}>Geçmiş Biletler</h2>
          {pastTickets.length === 0 ? (
            <div className="temporary-panel">Geçmiş biletiniz bulunmuyor.</div>
          ) : (
            <div className="profile-ticket-list">
              {pastTickets.map((r) => (
                <div key={r.id} className="profile-ticket-card profile-ticket-past">
                  <div className="profile-ticket-header">
                    <strong>{r.id}</strong>
                    <span>{new Date(r.createdAt).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="profile-ticket-body">
                    <span>{r.ticketCount} bilet</span>
                    <span>{r.totalPrice?.toFixed(2)} ₺</span>
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
                        <div className="profile-watchlist-no-poster">🎬</div>
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
