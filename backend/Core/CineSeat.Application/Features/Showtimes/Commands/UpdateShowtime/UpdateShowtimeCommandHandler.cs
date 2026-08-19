using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.UpdateShowtime;

public class UpdateShowtimeCommandHandler : IRequestHandler<UpdateShowtimeCommand, Unit>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IShowtimeWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IHallReadRepository _hallRead;

    public UpdateShowtimeCommandHandler(
        IShowtimeReadRepository read,
        IShowtimeWriteRepository write,
        IMovieReadRepository movieRead,
        IHallReadRepository hallRead)
    {
        _read = read;
        _write = write;
        _movieRead = movieRead;
        _hallRead = hallRead;
    }

    public async Task<Unit> Handle(UpdateShowtimeCommand request, CancellationToken cancellationToken)
    {
        var showtime = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.Id);

        var movie = await _movieRead.GetByIdAsync(request.MovieId, tracking: false, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.MovieId);

        var hall = await _hallRead.GetByIdAsync(request.HallId, tracking: false, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.HallId);

        showtime.MovieId = request.MovieId;
        showtime.HallId = request.HallId;
        showtime.StartDatetime = request.StartDatetime;
        showtime.BasePrice = request.BasePrice;
        showtime.Format = request.Format;

        _write.Update(showtime);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
