import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth.js";
import useWatchlist from "../hooks/useWatchlist.js";
import movieService from "../services/movieService.js";
import reservationService from "../services/reservationService.js";
import profileService from "../services/profileService.js";
import sessionService from "../services/sessionService.js";
import { validateRegisterForm } from "../services/validation.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import useTabs from "../hooks/useTabs.js";

import "./profile.css";

/**
 * Sprint 3 — Profil sayfası
 * 1.2.5: Kişisel bilgi formu (REQ-18)
 * 1.2.6: Bilet sekmeleri — güncel ve geçmiş (REQ-18)
 * 1.2.8: İzleme listem sekmesi + bildirim (REQ-25)
 *
 * Faz 4 (spec §8): sekmeli düzen + gerçek bilet görünümlü kartlar.
 *
 * Spec §8 dördüncü bir "Yorumlarım" sekmesi de öngörüyordu; EKLENMEDİ.
 * Sebep: commentService yalnızca `getCommentsByMovieId` sunuyor, "bu
 * kullanıcının yorumları" diye bir backend ucu yok. Sekmeyi eklemek yeni
 * bir uç gerektirirdi ve spec §11 backend değişikliğini bu revizyonun
 * kapsamı dışında bırakıyor. Uç eklendiğinde sekme buraya girer.
 */

const PROFILE_TABS = [
  { id: "info", label: "Bilgilerim" },
  { id: "tickets", label: "Biletlerim" },
  { id: "watchlist", label: "İzleme Listem" },
];

/**
 * Tek bir rezervasyon — fiziksel bilete benzeyen kart (spec §8):
 * solda bilgi gövdesi, kesikli perforasyondan sonra sağda koçan.
 */
function TicketCard({ reservation, isPast = false }) {
  return (
    <article
      className={
        isPast
          ? "profile-ticket-card profile-ticket-past"
          : "profile-ticket-card"
      }
    >
      <div className="profile-ticket-body">
        <p className="profile-ticket-movie">{reservation.movieTitle}</p>

        <div className="profile-ticket-meta">
          <span>
            {new Date(reservation.startDatetime).toLocaleString("tr-TR")}
          </span>
          <span>{reservation.ticketCount} bilet</span>
        </div>

        <span className="profile-ticket-resno">{reservation.resNo}</span>
      </div>

      <div className="profile-ticket-stub">
        {/* Dekoratif yer tutucu: gerçek QR üretimi backend işi (spec §11). */}
        <span className="profile-ticket-qr" aria-hidden="true" />

        <span className="profile-ticket-total">
          {reservation.total.toFixed(2)} ₺
        </span>
      </div>
    </article>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const { getFavoriteMovieIds, toggleFavorite } = useWatchlist();

  const { activeTab, getTabProps, getPanelProps } = useTabs(
    PROFILE_TABS.map((tab) => tab.id),
    { idPrefix: "profile" }
  );

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
    <section className="profile-page">
      <PageHeader
        title="Profilim"
        description={`Hoşgeldin, ${user?.name ?? ""}`.trim()}
      />

      {/* Sekme navigasyonu — ARIA deseni useTabs'tan gelir (ok tuşları,
          roving tabindex, panel bağı). */}
      <div className="profile-tab-list" role="tablist" aria-label="Profil bölümleri">
        {PROFILE_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              {...getTabProps(tab.id)}
              className={
                isActive
                  ? "profile-tab-button profile-tab-button-active"
                  : "profile-tab-button"
              }
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
        <div className="profile-panel" {...getPanelProps("info")}>
          {saveMessage && (
            <div className="profile-save-message" role="status">
              {saveMessage}
            </div>
          )}

          <div className="profile-form">
            <div className="profile-form-row">
              <div className="profile-field">
                <label htmlFor="profile-firstName">Ad</label>
                <input
                  id="profile-firstName"
                  className="input"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  disabled={!editMode}
                  aria-invalid={Boolean(formErrors.firstName)}
                />
                {formErrors.firstName && (
                  <span className="profile-field-error">
                    {formErrors.firstName}
                  </span>
                )}
              </div>
              <div className="profile-field">
                <label htmlFor="profile-lastName">Soyad</label>
                <input
                  id="profile-lastName"
                  className="input"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  disabled={!editMode}
                  aria-invalid={Boolean(formErrors.lastName)}
                />
                {formErrors.lastName && (
                  <span className="profile-field-error">
                    {formErrors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">E-posta</label>
              <input
                id="profile-email"
                className="input"
                type="email"
                value={formData.email}
                disabled
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-username">Kullanıcı Adı</label>
              <input
                id="profile-username"
                className="input"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleFormChange}
                disabled={!editMode}
                aria-invalid={Boolean(formErrors.username)}
              />
              {formErrors.username && (
                <span className="profile-field-error">
                  {formErrors.username}
                </span>
              )}
            </div>

            <div className="profile-form-row">
              <div className="profile-field">
                <label htmlFor="profile-phone">Telefon</label>
                <input
                  id="profile-phone"
                  className="input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  disabled={!editMode}
                />
              </div>
              <div className="profile-field">
                <label htmlFor="profile-gender">Cinsiyet</label>
                <select
                  id="profile-gender"
                  className="input"
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
                    className="btn btn--primary btn--md"
                    onClick={handleSave}
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--md"
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
                  className="btn btn--primary btn--md"
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
        <div className="profile-panel" {...getPanelProps("tickets")}>
          <h2 className="profile-section-title">Güncel Biletler</h2>
          {currentTickets.length === 0 ? (
            <EmptyState
              title="Güncel biletiniz bulunmuyor."
              description="Bir seans seçtiğinizde biletiniz burada görünecek."
            />
          ) : (
            <div className="profile-ticket-list">
              {currentTickets.map((reservation) => (
                <TicketCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}

          <h2 className="profile-section-title profile-section-title--spaced">
            Geçmiş Biletler
          </h2>
          {pastTickets.length === 0 ? (
            <EmptyState title="Geçmiş biletiniz bulunmuyor." />
          ) : (
            <div className="profile-ticket-list">
              {pastTickets.map((reservation) => (
                <TicketCard
                  key={reservation.id}
                  reservation={reservation}
                  isPast
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* İZLEME LİSTEM */}
      {activeTab === "watchlist" && (
        <div className="profile-panel" {...getPanelProps("watchlist")}>
          {favoriteMovies.length === 0 ? (
            <EmptyState
              icon="♡"
              title="İzleme listeniz boş."
              description="Film kartlarındaki kalp ikonuna tıklayarak favori ekleyebilirsiniz."
            />
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
                      <strong className="profile-watchlist-title">
                        {movie.title}
                      </strong>
                      {isReleased ? (
                        <span className="badge badge--success">Vizyonda</span>
                      ) : (
                        <span className="badge badge--neutral">
                          {daysLeft > 0 ? `${daysLeft} gün kaldı` : "Bugün vizyonda"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="profile-watchlist-remove"
                      onClick={() => toggleFavorite(movie.id)}
                      title="İzleme listesinden çıkar"
                      aria-label={`${movie.title} filmini izleme listesinden çıkar`}
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
