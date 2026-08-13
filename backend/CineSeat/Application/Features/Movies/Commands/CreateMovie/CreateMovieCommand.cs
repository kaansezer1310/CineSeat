using CineSeat.Application.Common.Models;
using MediatR;

namespace CineSeat.Application.Features.Movies.Commands.CreateMovie
{
    /// <summary>
    /// YAZMA tarafı (Command). Sadece "ne yapılmak isteniyor" bilgisini taşır,
    /// nasıl yapılacağını bilmez. Yeni bir film oluşturur ve id'sini döndürür.
    /// </summary>
    public record CreateMovieCommand(
        string Title,
        short Duration,
        string Description,
        short AgeLimit,
        string Language,
        string Poster,
        DateTime StartDate,
        DateTime EndDate) : IRequest<Result<long>>;
}
