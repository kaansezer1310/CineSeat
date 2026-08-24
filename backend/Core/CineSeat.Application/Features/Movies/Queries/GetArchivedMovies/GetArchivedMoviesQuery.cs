using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Movies.Queries.GetArchivedMovies;

public class GetArchivedMoviesQuery : IRequest<PagedResult<MovieDto>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
