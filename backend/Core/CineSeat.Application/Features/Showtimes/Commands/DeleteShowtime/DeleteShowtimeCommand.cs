using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.DeleteShowtime;

public class DeleteShowtimeCommand : IRequest<Unit>
{
    public long Id { get; set; }
}
