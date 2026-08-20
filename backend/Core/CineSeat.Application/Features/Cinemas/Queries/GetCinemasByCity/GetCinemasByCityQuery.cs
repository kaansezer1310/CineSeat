using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Cinemas.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemasByCity;

public class GetCinemasByCityQuery : IRequest<PagedResult<CinemaDto>>
{
    public long CityId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
