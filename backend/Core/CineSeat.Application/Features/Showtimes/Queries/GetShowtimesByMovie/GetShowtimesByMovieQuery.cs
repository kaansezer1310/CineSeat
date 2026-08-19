using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;

public class GetShowtimesByMovieQuery : IRequest<List<ShowtimeDto>>
{
    public long MovieId { get; set; }
}
