using CineSeat.Application.Features.Reservations.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Reservations.Queries.GetReservationById;

public class GetReservationByIdQuery : IRequest<ReservationDto>
{
    public long Id { get; set; }
}
