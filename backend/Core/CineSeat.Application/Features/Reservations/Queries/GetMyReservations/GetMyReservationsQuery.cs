using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Reservations.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

// NOT: Auth henüz yok — UserId istekle geliyor, auth eklenince current user'dan alınmalı.
public class GetMyReservationsQuery : IRequest<PagedResult<ReservationSummaryDto>>
{
    public long UserId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
