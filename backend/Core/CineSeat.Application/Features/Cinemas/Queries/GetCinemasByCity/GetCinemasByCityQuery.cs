using CineSeat.Application.Features.Cinemas.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQuery : IRequest<List<CinemaDto>>
{
    public long CityId { get; set; }
}
