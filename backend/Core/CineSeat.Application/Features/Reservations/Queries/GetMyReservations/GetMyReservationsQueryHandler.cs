using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

public class GetMyReservationsQueryHandler : IRequestHandler<GetMyReservationsQuery, List<ReservationSummaryDto>>
{
    private readonly IReservationReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetMyReservationsQueryHandler(IReservationReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<ReservationSummaryDto>> Handle(
        GetMyReservationsQuery request, CancellationToken cancellationToken)
    {
        // Showtime.Movie navigation üzerinden JOIN — ayrı bir repository gerekmez.
        var query = _read.GetWhere(r => r.UserId == request.UserId, tracking: false)
            .OrderByDescending(r => r.CreatedAt)
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

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
