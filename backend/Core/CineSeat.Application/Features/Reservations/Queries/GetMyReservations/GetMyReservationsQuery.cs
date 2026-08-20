using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Reservations.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetMyReservations;

// UserId BİLİNÇLİ OLARAK YOK — "benim rezervasyonlarım" sorgusu kullanıcıyı
// ICurrentUserService'ten (JWT'den) okur. İstekle gelseydi ?userId=5 yazan
// herkes başkasının rezervasyonlarını görüntüleyebilirdi.
public class GetMyReservationsQuery : IRequest<PagedResult<ReservationSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
