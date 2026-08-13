using CineSeat.Application.Common.Models;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovies
{
    /// <summary>
    /// OKUMA tarafı (Query). Sistemin durumunu değiştirmez.
    /// CQRS'in özü tam olarak burada görülür: aynı Movie tablosuna
    /// yazma ve okuma iki ayrı tip, iki ayrı handler ile gider.
    /// </summary>
    public record GetMoviesQuery(
        string? Search = null,
        int Page = 1,
        int PageSize = 10) : IRequest<Result<PagedResult<MovieDto>>>;
}
