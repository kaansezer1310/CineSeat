using MediatR;

namespace CineSeat.Application.Features.SeatLocks.Commands.LockSeat;

// NOT: Auth henüz bu branch'e eklenmedi (Ömer'in Faz 1 işi). UserId bu yüzden
// şimdilik istekle birlikte gönderiliyor; auth gelince ICurrentUserService'ten
// alınacak şekilde değiştirilmesi gerekir.
public class LockSeatCommand : IRequest<long>
{
    public long ShowtimeId { get; set; }
    public long SeatId { get; set; }
    public long UserId { get; set; }
    public int LockMinutes { get; set; } = 10;
}
