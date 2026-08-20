using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CancelReservation;

// NOT: Auth henüz yok — UserId istekle geliyor (sahiplik kontrolü için).
public class CancelReservationCommand : IRequest<Unit>
{
    public long Id { get; set; }
    public long UserId { get; set; }
}
