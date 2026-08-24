export const PERMISSIONS = Object.freeze({
  MOVIE_MANAGE: "movie.manage",
  GENRE_MANAGE: "genre.manage",
  CAMPAIGN_MANAGE: "campaign.manage",
  CINEMA_MANAGE: "cinema.manage",
  SHOWTIME_MANAGE: "showtime.manage",
  RESERVATION_READ: "reservation.read",
  RESERVATION_MANAGE: "reservation.manage",
  COMMENT_MODERATE: "comment.moderate",
  USER_MANAGE: "user.manage",
});

export const ADMIN_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS));
