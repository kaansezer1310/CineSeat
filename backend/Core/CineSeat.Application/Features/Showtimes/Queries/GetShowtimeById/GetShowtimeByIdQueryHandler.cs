using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimeById;

public class GetShowtimeByIdQueryHandler : IRequestHandler<GetShowtimeByIdQuery, ShowtimeDto>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetShowtimeByIdQueryHandler(IShowtimeReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<ShowtimeDto> Handle(GetShowtimeByIdQuery request, CancellationToken cancellationToken)
    {
        // GetByIdAsync navigation'lari getirmedigi icin HallName/CinemaName/
        // TotalSeats bos kalirdi; projeksiyonlu sorgu hepsini tek gidiste alir.
        var query = _read
            .GetWhere(s => s.Id == request.Id, tracking: false)
            .Select(s => new ShowtimeDto
            {
                Id = s.Id,
                MovieId = s.MovieId,
                HallId = s.HallId,
                StartDatetime = s.StartDatetime,
                BasePrice = s.BasePrice,
                Format = s.Format,
                HallName = s.Hall.Name,
                CinemaName = s.Hall.Cinema.Name,
                TotalSeats = s.Hall.Seats.Count(seat => seat.IsActive)
            });

        var showtime = await _executor.FirstOrDefaultAsync(query, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.Id);

        return showtime;
    }
}
