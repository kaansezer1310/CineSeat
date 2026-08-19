using CineSeat.Application.Features.Cinemas.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemaById;

public class GetCinemaByIdQuery : IRequest<CinemaDto>
{
    public long Id { get; set; }
}
