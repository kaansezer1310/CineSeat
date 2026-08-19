using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

public class GetMyReservationsQueryHandler
    : IRequestHandler<GetMyReservationsQuery, PagedResult<ReservationSummaryDto>>
{
    private readonly IReservationReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetMyReservationsQueryHandler(IReservationReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<ReservationSummaryDto>> Handle(
        GetMyReservationsQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _read.GetWhere(r => r.UserId == request.UserId, tracking: false);

        var totalCount = await _executor.CountAsync(baseQuery, cancellationToken);

        // Showtime.Movie navigation üzerinden JOIN — ayrı bir repository gerekmez.
        var pageQuery = baseQuery
            .OrderByDescending(r => r.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new ReservationSummaryDto
            {
                Id = r.Id,
                ResNo = r.ResNo,
                ShowtimeId = r.ShowtimeId,
                ShowtimeStart = r.Showtime.StartDatetime,
                MovieTitle = r.Showtime.Movie.Title,
                Total = r.Total,
                Status = r.Status
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<ReservationSummaryDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
