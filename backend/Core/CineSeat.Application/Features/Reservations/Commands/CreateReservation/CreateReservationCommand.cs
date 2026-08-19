using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CreateReservation;

public class ReservationSeatItem
{
    public long SeatId { get; set; }
    public TicketType TicketType { get; set; }
}

// UserId BİLİNÇLİ OLARAK YOK — rezervasyonu yapan kullanıcı ICurrentUserService'ten
// (JWT'den) okunur. İstekle gelseydi herkes başkası adına rezervasyon yapabilirdi.
//
// CampaignId verilirse indirim uygulanır; kampanyanın aktif olması ve sepetin
// MinCartTotal eşiğini geçmesi handler'da doğrulanır.
public class CreateReservationCommand : IRequest<ReservationDto>
{
    public long ShowtimeId { get; set; }
    public long? CampaignId { get; set; }
    public string BuyerFname { get; set; } = string.Empty;
    public string BuyerLname { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public List<ReservationSeatItem> Seats { get; set; } = new();
}
