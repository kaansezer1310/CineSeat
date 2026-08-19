using CineSeat.Application.Features.Genres.DTOs;
using MediatR;

namespace CineSeat.Application.Features.MovieGenres.Queries.GetGenresOfMovie;

public class GetGenresOfMovieQuery : IRequest<List<GenreDto>>
{
    public long MovieId { get; set; }
}
