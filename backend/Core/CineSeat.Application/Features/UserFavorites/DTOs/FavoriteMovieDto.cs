namespace CineSeat.Application.Features.UserFavorites.DTOs;

/// <summary>
/// Favori listesi satırı. Kullanıcının kendi favorisi olduğu zaten bağlamdan
/// belli olduğu için UserId taşınmıyor.
/// </summary>
public class FavoriteMovieDto
{
    public long MovieId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public decimal AvgScore { get; set; }
    public DateTimeOffset AddedAt { get; set; }
}
