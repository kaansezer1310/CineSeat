using CineSeat.Application.Features.Halls.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Halls.Queries.GetHallById;

public class GetHallByIdQuery : IRequest<HallDto>
{
    public long Id { get; set; }
}
