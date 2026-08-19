using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;

public class GetShowtimesByCinemaQuery : IRequest<PagedResult<ShowtimeDto>>
{
    public long CinemaId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
