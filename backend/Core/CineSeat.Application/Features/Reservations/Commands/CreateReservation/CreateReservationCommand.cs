using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Commands.CreateReservation;

public class ReservationSeatItem
{
    public long SeatId { get; set; }
    public TicketType TicketType { get; set; }
}

// NOT: Auth henüz bu branch'e eklenmedi (Ömer'in Faz 1 işi). UserId bu yüzden
// şimdilik istekle birlikte gönderiliyor; auth gelince ICurrentUserService'ten
// alınacak şekilde değiştirilmesi gerekir.
//
// NOT: CampaignId kabul edilir ve Reservation'a kaydedilir ama indirim HENÜZ
// UYGULANMAZ — Campaign CRUD/repository'si Ömer'in Faz 2 (Katalog) işi ve bu
// branch'te henüz yok. Campaign eklenince Discount hesaplaması buraya bağlanmalı.
public class CreateReservationCommand : IRequest<ReservationDto>
{
    public long UserId { get; set; }
    public long ShowtimeId { get; set; }
    public long? CampaignId { get; set; }
    public string BuyerFname { get; set; } = string.Empty;
    public string BuyerLname { get; set; } = string.Empty;
    public string BuyerEmail { get; set; } = string.Empty;
    public List<ReservationSeatItem> Seats { get; set; } = new();
}
