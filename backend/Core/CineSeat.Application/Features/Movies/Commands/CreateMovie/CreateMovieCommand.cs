using CineSeat.Application.Common.Models;
using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.CreateMovie;

/// <summary>
/// YAZMA tarafı (Command). Sadece "ne yapılmak isteniyor" bilgisini taşır,
/// nasıl yapılacağını bilmez. Yeni bir film oluşturur ve id'sini döndürür.
/// </summary>
public class CreateMovieCommand : IRequest<Result<long>>
{
    public string Title { get; set; } = string.Empty;
    public short Duration { get; set; }
    public string Description { get; set; } = string.Empty;
    public short AgeLimit { get; set; }
    public string Language { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}
