using CineSeat.Application.Common.Constants;
using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CancelReservation;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, Unit>
{
    private readonly IReservationReadRepository _read;
    private readonly IReservationWriteRepository _write;
    private readonly ICurrentUserService _currentUser;

    public CancelReservationCommandHandler(
        IReservationReadRepository read,
        IReservationWriteRepository write,
        ICurrentUserService currentUser)
    {
        _read = read;
        _write = write;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.GetRequiredUserId();
        var isAdmin = _currentUser.Role == RoleNames.Admin;

        var reservation = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);

        // Başkasına ait rezervasyonun var olduğunu bile sızdırmamak için sahiplik
        // uyuşmazlığını da NotFound olarak döndürüyoruz. Admin her rezervasyonu
        // iptal edebilir (müşteri hizmetleri).
        if (reservation is null || (reservation.UserId != userId && !isAdmin))
            throw new NotFoundException("Rezervasyon", request.Id);

        if (reservation.Status == ReservationStatus.Cancelled)
            throw new ConflictException("Rezervasyon zaten iptal edilmiş.");

        reservation.Status = ReservationStatus.Cancelled;

        _write.Update(reservation);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
