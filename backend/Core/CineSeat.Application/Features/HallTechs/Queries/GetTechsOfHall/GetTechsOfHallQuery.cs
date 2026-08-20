using CineSeat.Application.Features.HallTechs.DTOs;
using MediatR;

namespace CineSeat.Application.Features.HallTechs.Queries.GetTechsOfHall;

public class GetTechsOfHallQuery : IRequest<List<HallTechDto>>
{
    public long HallId { get; set; }
}
