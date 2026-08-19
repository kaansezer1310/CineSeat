using CineSeat.Application.Features.Seats.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Seats.Queries.GetSeatMap;

public class GetSeatMapQuery : IRequest<List<SeatDto>>
{
    public long HallId { get; set; }
}
