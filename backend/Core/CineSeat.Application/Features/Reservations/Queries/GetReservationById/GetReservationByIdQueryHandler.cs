using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetReservationById;

public class GetReservationByIdQueryHandler : IRequestHandler<GetReservationByIdQuery, ReservationDto>
{
    private readonly IReservationReadRepository _reservationRead;
    private readonly ITicketReadRepository _ticketRead;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _executor;

    public GetReservationByIdQueryHandler(
        IReservationReadRepository reservationRead,
        ITicketReadRepository ticketRead,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor executor)
    {
        _reservationRead = reservationRead;
        _ticketRead = ticketRead;
        _currentUser = currentUser;
        _executor = executor;
    }

    public async Task<ReservationDto> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var canReadAll = _currentUser.HasPermission(PermissionNames.ReservationRead);

        var reservation = await _reservationRead.GetByIdAsync(request.Id, tracking: false, cancellationToken);

        // Sahiplik kontrolü ŞART: olmasaydı id deneyen herkes başkasının
        // rezervasyonunu (alıcı adı, e-postası, tutarı dahil) okuyabilirdi.
        // Yetkisiz erişim, kaydın varlığını sızdırmamak için NotFound döner.
        if (reservation is null || (reservation.UserId != userId && !canReadAll))
            throw new NotFoundException("Rezervasyon", request.Id);

        var ticketsQuery = _ticketRead.GetWhere(t => t.ReservationId == request.Id, tracking: false)
            .Select(t => new TicketDto
            {
                Id = t.Id,
                ReservationId = t.ReservationId,
                SeatId = t.SeatId,
                TicketType = t.TicketType,
                Price = t.Price
            });
        var tickets = await _executor.ToListAsync(ticketsQuery, cancellationToken);

        return new ReservationDto
        {
            Id = reservation.Id,
            ResNo = reservation.ResNo,
            ShowtimeId = reservation.ShowtimeId,
            CampaignId = reservation.CampaignId,
            BuyerFname = reservation.BuyerFname,
            BuyerLname = reservation.BuyerLname,
            BuyerEmail = reservation.BuyerEmail,
            Subtotal = reservation.Subtotal,
            Discount = reservation.Discount,
            Total = reservation.Total,
            Status = reservation.Status,
            Tickets = tickets
        };
    }
}
