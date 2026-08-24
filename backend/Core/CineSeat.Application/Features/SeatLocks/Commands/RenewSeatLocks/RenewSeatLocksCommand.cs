using CineSeat.Application.Features.SeatLocks.DTOs;
using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.RenewSeatLocks;

// Odeme ekranindaki geri sayim bitmeden secimin tamamini uzatmak icin.
// Tek tek POST /api/seatlocks yinelemek de sureyi uzatiyor ama koltuk
// basina bir gidis-gelis demek; burada secim tek istekte yenilenir.
//
// UserId BILINCLI OLARAK YOK — kilidin sahibi ICurrentUserService'ten okunur.
public class RenewSeatLocksCommand : IRequest<IReadOnlyList<SeatLockDto>>
{
    public long ShowtimeId { get; set; }
    public List<long> SeatIds { get; set; } = new();
    public int LockMinutes { get; set; } = 10;
}
