using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Showtimes.Common;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.UpdateShowtime;

public class UpdateShowtimeCommandHandler : IRequestHandler<UpdateShowtimeCommand, Unit>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IShowtimeWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IHallReadRepository _hallRead;
    private readonly IAsyncQueryExecutor _executor;

    public UpdateShowtimeCommandHandler(
        IShowtimeReadRepository read,
        IShowtimeWriteRepository write,
        IMovieReadRepository movieRead,
        IHallReadRepository hallRead,
        IAsyncQueryExecutor executor)
    {
        _read = read;
        _write = write;
        _movieRead = movieRead;
        _hallRead = hallRead;
        _executor = executor;
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

        // Saati/salonu degismeyen bir duzenleme (or. yalnizca fiyat) gecmis
        // seanslarda da yapilabilmeli; bu yuzden "gecmiste olamaz" kurali
        // sadece baslangic degistiginde uygulanir.
        if (showtime.StartDatetime != request.StartDatetime)
            ShowtimeConflictChecker.EnsureNotInPast(request.StartDatetime);

        await ShowtimeConflictChecker.EnsureNoConflictAsync(
            _read,
            _movieRead,
            _executor,
            request.HallId,
            request.StartDatetime,
            movie.Duration,
            // Seansin kendisi kendisiyle cakisiyor sayilmamali.
            excludedShowtimeId: showtime.Id,
            cancellationToken);

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
