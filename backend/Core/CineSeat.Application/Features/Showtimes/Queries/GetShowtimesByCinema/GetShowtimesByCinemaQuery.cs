using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;

public class GetShowtimesByCinemaQuery : IRequest<List<ShowtimeDto>>
{
    public long CinemaId { get; set; }
}
