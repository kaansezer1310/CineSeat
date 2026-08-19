using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.LockSeat;

// Koltuk kilitleme akışı:
//  1) Seans ve koltuk var mı, koltuk bu seansın salonuna mı ait — doğrula.
//  2) Koltuk zaten (iptal edilmemiş) bir rezervasyona bağlıysa reddet.
//  3) (ShowtimeId, SeatId) için SeatLock DB'de UNIQUE — bu yüzden yeni satır eklemek
//     yerine var olan satırı kontrol edip güncelliyoruz (süresi dolmuşsa devral,
//     dolmamışsa ve başka kullanıcıya aitse reddet, kendi kilidiyse süresini uzat).
public class LockSeatCommandHandler : IRequestHandler<LockSeatCommand, long>
{
    private readonly ISeatLockReadRepository _lockRead;
    private readonly ISeatLockWriteRepository _lockWrite;
    private readonly IShowtimeReadRepository _showtimeRead;
    private readonly ISeatReadRepository _seatRead;
    private readonly ITicketReadRepository _ticketRead;
    private readonly IUserReadRepository _userRead;

    public LockSeatCommandHandler(
        ISeatLockReadRepository lockRead,
        ISeatLockWriteRepository lockWrite,
        IShowtimeReadRepository showtimeRead,
        ISeatReadRepository seatRead,
        ITicketReadRepository ticketRead,
        IUserReadRepository userRead)
    {
        _lockRead = lockRead;
        _lockWrite = lockWrite;
        _showtimeRead = showtimeRead;
        _seatRead = seatRead;
        _ticketRead = ticketRead;
        _userRead = userRead;
    }

    public async Task<long> Handle(LockSeatCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRead.GetByIdAsync(request.UserId, tracking: false, cancellationToken);
        if (user is null)
            throw new NotFoundException("Kullanıcı", request.UserId);

        var showtime = await _showtimeRead.GetByIdAsync(request.ShowtimeId, tracking: false, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.ShowtimeId);

        var seat = await _seatRead.GetByIdAsync(request.SeatId, tracking: false, cancellationToken);
        if (seat is null)
            throw new NotFoundException("Koltuk", request.SeatId);

        if (seat.HallId != showtime.HallId)
            throw new ValidationException(new[]
            {
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.SeatId), "Bu koltuk, seçilen seansın salonuna ait değil.")
            });

        var alreadyBooked = await _ticketRead.GetSingleAsync(
            t => t.SeatId == request.SeatId
                 && t.Reservation.ShowtimeId == request.ShowtimeId
                 && t.Reservation.Status != ReservationStatus.Cancelled,
            tracking: false,
            cancellationToken);
        if (alreadyBooked is not null)
            throw new ConflictException("Bu koltuk bu seans için zaten rezerve edilmiş.");

        var now = DateTimeOffset.UtcNow;
        var existingLock = await _lockRead.GetSingleAsync(
            sl => sl.ShowtimeId == request.ShowtimeId && sl.SeatId == request.SeatId,
            tracking: true,
            cancellationToken);

        if (existingLock is null)
        {
            var newLock = new SeatLock
            {
                ShowtimeId = request.ShowtimeId,
                SeatId = request.SeatId,
                UserId = request.UserId,
                LockExpiresAt = now.AddMinutes(request.LockMinutes)
            };
            await _lockWrite.AddAsync(newLock, cancellationToken);
            await _lockWrite.SaveAsync(cancellationToken);
            return newLock.Id;
        }

        var isExpired = existingLock.LockExpiresAt < now;
        var isSameUser = existingLock.UserId == request.UserId;

        if (!isExpired && !isSameUser)
            throw new ConflictException("Bu koltuk şu anda başka bir kullanıcı tarafından kilitli.");

        // Süresi dolmuş ya da aynı kullanıcı → satırı devral / yenile (unique constraint korunur).
        existingLock.UserId = request.UserId;
        existingLock.LockExpiresAt = now.AddMinutes(request.LockMinutes);

        _lockWrite.Update(existingLock);
        await _lockWrite.SaveAsync(cancellationToken);

        return existingLock.Id;
    }
}
