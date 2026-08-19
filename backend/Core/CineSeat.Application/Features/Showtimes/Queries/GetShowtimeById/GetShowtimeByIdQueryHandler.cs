using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimeById;

public class GetShowtimeByIdQueryHandler : IRequestHandler<GetShowtimeByIdQuery, ShowtimeDto>
{
    private readonly IShowtimeReadRepository _read;

    public GetShowtimeByIdQueryHandler(IShowtimeReadRepository read) => _read = read;

    public async Task<ShowtimeDto> Handle(GetShowtimeByIdQuery request, CancellationToken cancellationToken)
    {
        var showtime = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (showtime is null)
            throw new NotFoundException("Seans", request.Id);

        return new ShowtimeDto
        {
            Id = showtime.Id,
            MovieId = showtime.MovieId,
            HallId = showtime.HallId,
            StartDatetime = showtime.StartDatetime,
            BasePrice = showtime.BasePrice,
            Format = showtime.Format
        };
    }
}
