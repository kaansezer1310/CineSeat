namespace CineSeat.Application.Features.Movies.Queries.GetMovies
{
    /// <summary>
    /// Dışarıya açılan sözleşme. Domain entity'si (Movie) hiçbir zaman
    /// controller'dan dönmez — navigation property'leri, IsDeleted gibi iç alanları
    /// ve olası döngüsel referansları API'ye sızdırmamak için araya bu DTO girer.
    /// </summary>
    public record MovieDto(
        long Id,
        string Title,
        short Duration,
        string Description,
        short AgeLimit,
        string Language,
        string Poster,
        DateTime StartDate,
        DateTime EndDate,
        decimal AvgScore);
}
