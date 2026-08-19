using CineSeat.Domain.Enums;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.CreateShowtime;

public class CreateShowtimeCommand : IRequest<long>
{
    public long MovieId { get; set; }
    public long HallId { get; set; }
    public DateTimeOffset StartDatetime { get; set; }
    public decimal BasePrice { get; set; }
    public ScreeningFormat Format { get; set; }
}
