using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CancelReservation;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, Unit>
{
    private readonly IReservationReadRepository _read;
    private readonly IReservationWriteRepository _write;

    public CancelReservationCommandHandler(IReservationReadRepository read, IReservationWriteRepository write)
    {
        _read = read;
        _write = write;
    }

    public async Task<Unit> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);

        // Başkasına ait rezervasyonun var olduğunu bile sızdırmamak için (auth henüz yok,
        // gerçek yetkilendirme Ömer'in Faz 1 işiyle gelince burada netleşecek) sahiplik
        // uyuşmazlığını da NotFound olarak döndürüyoruz.
        if (reservation is null || reservation.UserId != request.UserId)
            throw new NotFoundException("Rezervasyon", request.Id);

        if (reservation.Status == ReservationStatus.Cancelled)
            throw new ConflictException("Rezervasyon zaten iptal edilmiş.");

        reservation.Status = ReservationStatus.Cancelled;

        _write.Update(reservation);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
