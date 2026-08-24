using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimeSeatMap;

public class GetShowtimeSeatMapQuery : IRequest<IReadOnlyList<ShowtimeSeatDto>>
{
    public long ShowtimeId { get; set; }
}
