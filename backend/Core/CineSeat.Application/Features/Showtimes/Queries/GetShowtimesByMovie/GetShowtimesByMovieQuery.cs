using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Showtimes.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;

public class GetShowtimesByMovieQuery : IRequest<PagedResult<ShowtimeDto>>
{
    public long MovieId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
