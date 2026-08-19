using CineSeat.Application.Features.Reservations.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

// NOT: Auth henüz yok — UserId istekle geliyor, auth eklenince current user'dan alınmalı.
public class GetMyReservationsQuery : IRequest<List<ReservationSummaryDto>>
{
    public long UserId { get; set; }
}
