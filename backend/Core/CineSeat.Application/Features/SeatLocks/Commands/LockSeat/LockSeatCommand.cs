using CineSeat.Application.Features.SeatLocks.DTOs;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.LockSeat;

// UserId BİLİNÇLİ OLARAK YOK — kilidi alan kullanıcı ICurrentUserService'ten
// (JWT'den) okunur. İstekle gelseydi başkasının adına koltuk kilitlenebilir,
// hatta başkasının kilidi devralınabilirdi.
public class LockSeatCommand : IRequest<SeatLockDto>
{
    public long ShowtimeId { get; set; }
    public long SeatId { get; set; }
    public int LockMinutes { get; set; } = 10;
}
