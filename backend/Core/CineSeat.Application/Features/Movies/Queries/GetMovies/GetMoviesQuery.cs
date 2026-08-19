using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetMovies;

/// <summary>
/// OKUMA tarafı (Query). Sistemin durumunu değiştirmez.
/// CQRS'in özü tam olarak burada görülür: aynı Movie tablosuna
/// yazma ve okuma iki ayrı tip, iki ayrı handler ile gider.
/// </summary>
public class GetMoviesQuery : IRequest<PagedResult<MovieDto>>
{
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
