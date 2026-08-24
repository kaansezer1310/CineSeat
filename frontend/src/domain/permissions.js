/**
 * İzin adları — backend'de DbInitializer ile seed edilen değerlerin birebir
 * karşılığı (bkz. backend/.../Persistence/Data/DbInitializer.cs).
 *
 * Bu dosya frontend'in izin sözleşmesidir (T5): menü, rota ve eylem
 * görünürlüğü rol sabitine değil bu adlara bakar.
 */
export const PERMISSIONS = {
  MOVIE_MANAGE: "movie.manage",
  GENRE_MANAGE: "genre.manage",
  CAMPAIGN_MANAGE: "campaign.manage",
  CINEMA_MANAGE: "cinema.manage",
  SHOWTIME_MANAGE: "showtime.manage",
  RESERVATION_READ: "reservation.read",
  COMMENT_MODERATE: "comment.moderate",
};

export const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS));

/**
 * Yönetim panelinin herhangi bir ekranını görebilmek için yeterli olan
 * izinler. Bunlardan en az birine sahip kullanıcıya ana menüde "Yönetim"
 * bağlantısı gösterilir.
 */
export const ADMIN_PANEL_PERMISSIONS = Object.freeze([
  PERMISSIONS.MOVIE_MANAGE,
  PERMISSIONS.GENRE_MANAGE,
  PERMISSIONS.CAMPAIGN_MANAGE,
  PERMISSIONS.CINEMA_MANAGE,
  PERMISSIONS.SHOWTIME_MANAGE,
  PERMISSIONS.RESERVATION_READ,
  PERMISSIONS.COMMENT_MODERATE,
]);

/**
 * Kullanıcının etkin izin listesi.
 *
 * T5 geçiş dönemi: backend henüz izinleri token/profil cevabında döndürmüyor
 * (Kişi 2 · Faz 1). O gelene kadar admin rolü tüm izinlere sahip sayılır;
 * cevaba `permissions` eklendiği anda bu geri düşüş kendiliğinden devre dışı
 * kalır ve burada kod değişikliği gerekmez.
 *
 * Not: bu yalnızca GÖRÜNÜRLÜK kararıdır. Yetkinin asıl uygulandığı yer
 * backend policy'leridir; UI'da gizlemek tek başına güvenlik değildir.
 */
export function resolvePermissions(user) {
  if (Array.isArray(user?.permissions)) {
    return user.permissions;
  }

  return user?.role === "admin" ? [...ALL_PERMISSIONS] : [];
}

export function hasPermission(user, permission) {
  return resolvePermissions(user).includes(permission);
}

export function hasAnyPermission(user, permissions = []) {
  const granted = resolvePermissions(user);
  return permissions.some((permission) => granted.includes(permission));
}
