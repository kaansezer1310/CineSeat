using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Reservations.DTOs;
using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetReservations;

/// <summary>
/// reservation.read iznine sahip yönetim kullanıcıları için tüm rezervasyonlar.
/// Tarih filtresi rezervasyonun oluşturulma anına değil seans başlangıcına uygulanır.
/// </summary>
public class GetReservationsQuery : IRequest<PagedResult<ReservationSummaryDto>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public DateTimeOffset? From { get; set; }
    public DateTimeOffset? To { get; set; }
    public long? MovieId { get; set; }
    public ReservationStatus? Status { get; set; }
}
