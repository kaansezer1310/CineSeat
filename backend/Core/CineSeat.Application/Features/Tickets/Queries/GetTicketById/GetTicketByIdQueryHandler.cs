using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Tickets.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Tickets.Queries.GetTicketById;

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, TicketDto>
{
    private readonly ITicketReadRepository _read;
    private readonly ICurrentUserService _currentUser;
    private readonly IAsyncQueryExecutor _executor;

    public GetTicketByIdQueryHandler(
        ITicketReadRepository read,
        ICurrentUserService currentUser,
        IAsyncQueryExecutor executor)
    {
        _read = read;
        _currentUser = currentUser;
        _executor = executor;
    }

    public async Task<TicketDto> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var canReadAll = _currentUser.HasPermission(PermissionNames.ReservationRead);

        // Sahibi tek sorguda öğrenmek için Reservation navigation'ı üzerinden
        // projeksiyon yapıyoruz; Include() bir EF metodu ve burada kullanılamaz.
        var row = await _executor.FirstOrDefaultAsync(
            _read.GetWhere(t => t.Id == request.Id, tracking: false)
                .Select(t => new
                {
                    Dto = new TicketDto
                    {
                        Id = t.Id,
                        ReservationId = t.ReservationId,
                        SeatId = t.SeatId,
                        TicketType = t.TicketType,
                        Price = t.Price
                    },
                    OwnerId = t.Reservation.UserId
                }),
            cancellationToken);

        if (row is null || (row.OwnerId != userId && !canReadAll))
            throw new NotFoundException("Bilet", request.Id);

        return row.Dto;
    }
}
