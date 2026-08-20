using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CancelReservation;

// UserId BİLİNÇLİ OLARAK YOK — sahiplik kontrolü ICurrentUserService üzerinden
// yapılır. İstekle gelseydi doğru userId'yi tahmin eden herkes başkasının
// rezervasyonunu iptal edebilirdi.
public class CancelReservationCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
