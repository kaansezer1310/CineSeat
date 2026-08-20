using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimeById;

public class GetShowtimeByIdQuery : IRequest<ShowtimeDto>
{
    public long Id { get; set; }
}
