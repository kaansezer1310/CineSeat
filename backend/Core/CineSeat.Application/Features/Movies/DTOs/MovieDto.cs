namespace CineSeat.Application.Features.Movies.DTOs;

/// <summary>
/// Dışarıya açılan sözleşme. Domain entity'si (Movie) hiçbir zaman
/// controller'dan dönmez — navigation property'leri, IsDeleted gibi iç alanları
/// ve olası döngüsel referansları API'ye sızdırmamak için araya bu DTO girer.
/// </summary>
public class MovieDto
{
    public long Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public short Duration { get; set; }
    public string Description { get; set; } = string.Empty;
    public short AgeLimit { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal AvgScore { get; set; }
}
