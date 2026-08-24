using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;

public class GetShowtimesByCinemaQueryHandler
    : IRequestHandler<GetShowtimesByCinemaQuery, PagedResult<ShowtimeDto>>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetShowtimesByCinemaQueryHandler(IShowtimeReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<ShowtimeDto>> Handle(
        GetShowtimesByCinemaQuery request, CancellationToken cancellationToken)
    {
        // Seans → Salon → Sinema: navigation üzerinden filtre (EF SQL JOIN'e çevirir).
        var baseQuery = _read.GetWhere(s => s.Hall.CinemaId == request.CinemaId, tracking: false);

        var totalCount = await _executor.CountAsync(baseQuery, cancellationToken);

        var pageQuery = baseQuery
            .OrderBy(s => s.StartDatetime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new ShowtimeDto
            {
                Id = s.Id,
                MovieId = s.MovieId,
                HallId = s.HallId,
                StartDatetime = s.StartDatetime,
                BasePrice = s.BasePrice,
                Format = s.Format,
                HallName = s.Hall.Name,
                CinemaName = s.Hall.Cinema.Name,
                TotalSeats = s.Hall.Seats.Count(seat => seat.IsActive)
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<ShowtimeDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
