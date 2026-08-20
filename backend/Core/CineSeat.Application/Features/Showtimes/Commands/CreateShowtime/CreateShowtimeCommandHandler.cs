using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Commands.CreateShowtime;

public class CreateShowtimeCommandHandler : IRequestHandler<CreateShowtimeCommand, long>
{
    private readonly IShowtimeWriteRepository _write;
    private readonly IMovieReadRepository _movieRead;
    private readonly IHallReadRepository _hallRead;

    public CreateShowtimeCommandHandler(
        IShowtimeWriteRepository write,
        IMovieReadRepository movieRead,
        IHallReadRepository hallRead)
    {
        _write = write;
        _movieRead = movieRead;
        _hallRead = hallRead;
    }

    public async Task<long> Handle(CreateShowtimeCommand request, CancellationToken cancellationToken)
    {
        var movie = await _movieRead.GetByIdAsync(request.MovieId, tracking: false, cancellationToken);
        if (movie is null)
            throw new NotFoundException("Film", request.MovieId);

        var hall = await _hallRead.GetByIdAsync(request.HallId, tracking: false, cancellationToken);
        if (hall is null)
            throw new NotFoundException("Salon", request.HallId);

        var showtime = new Showtime
        {
            MovieId = request.MovieId,
            HallId = request.HallId,
            StartDatetime = request.StartDatetime,
            BasePrice = request.BasePrice,
            Format = request.Format
        };

        await _write.AddAsync(showtime, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return showtime.Id;
    }
}
