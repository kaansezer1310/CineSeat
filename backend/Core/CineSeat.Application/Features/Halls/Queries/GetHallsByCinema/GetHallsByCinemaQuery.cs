using CineSeat.Application.Features.Halls.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Halls.Queries.GetHallsByCinema;

public class GetHallsByCinemaQuery : IRequest<List<HallDto>>
{
    public long CinemaId { get; set; }
}
