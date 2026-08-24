using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetReservations;

public class GetReservationsQueryHandler
    : IRequestHandler<GetReservationsQuery, PagedResult<ReservationSummaryDto>>
{
    private readonly IReservationReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetReservationsQueryHandler(
        IReservationReadRepository read,
        IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<ReservationSummaryDto>> Handle(
        GetReservationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false);

        if (request.From.HasValue)
            query = query.Where(reservation => reservation.Showtime.StartDatetime >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(reservation => reservation.Showtime.StartDatetime <= request.To.Value);

        if (request.MovieId.HasValue)
            query = query.Where(reservation => reservation.Showtime.MovieId == request.MovieId.Value);

        if (request.Status.HasValue)
            query = query.Where(reservation => reservation.Status == request.Status.Value);

        var totalCount = await _executor.CountAsync(query, cancellationToken);

        var pageQuery = query
            .OrderByDescending(reservation => reservation.Showtime.StartDatetime)
            .ThenByDescending(reservation => reservation.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(reservation => new ReservationSummaryDto
            {
                Id = reservation.Id,
                ResNo = reservation.ResNo,
                ShowtimeId = reservation.ShowtimeId,
                ShowtimeStart = reservation.Showtime.StartDatetime,
                MovieTitle = reservation.Showtime.Movie.Title,
                TicketCount = reservation.Tickets.Count,
                Total = reservation.Total,
                Status = reservation.Status
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<ReservationSummaryDto>(
            items,
            totalCount,
            request.PageNumber,
            request.PageSize);
    }
}
