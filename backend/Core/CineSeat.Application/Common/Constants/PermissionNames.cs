namespace CineSeat.Application.Common.Constants;

/// <summary>
/// Yetki adlarının tek kaynağı. Seed, JWT claim'leri ve authorization
/// policy'leri aynı değerleri kullanır; metin tabanlı yetkilerde yazım
/// hatasının sessiz bir erişim problemine dönüşmesini engeller.
/// </summary>
public static class PermissionNames
{
    public const string MovieManage = "movie.manage";
    public const string GenreManage = "genre.manage";
    public const string CampaignManage = "campaign.manage";
    public const string CinemaManage = "cinema.manage";
    public const string ShowtimeManage = "showtime.manage";
    public const string ReservationRead = "reservation.read";
    public const string ReservationManage = "reservation.manage";
    public const string CommentModerate = "comment.moderate";
    public const string UserManage = "user.manage";

    public static readonly IReadOnlyList<string> All =
    [
        MovieManage,
        GenreManage,
        CampaignManage,
        CinemaManage,
        ShowtimeManage,
        ReservationRead,
        ReservationManage,
        CommentModerate,
        UserManage
    ];
}

/// <summary>JWT içinde bir kullanıcının sahip olduğu her izin için tekrarlanan claim tipi.</summary>
public static class PermissionClaimTypes
{
    public const string Permission = "permission";
}
