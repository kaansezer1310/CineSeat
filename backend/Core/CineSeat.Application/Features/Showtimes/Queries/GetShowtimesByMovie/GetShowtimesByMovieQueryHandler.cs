using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;

public class GetShowtimesByMovieQueryHandler : IRequestHandler<GetShowtimesByMovieQuery, List<ShowtimeDto>>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetShowtimesByMovieQueryHandler(IShowtimeReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<ShowtimeDto>> Handle(GetShowtimesByMovieQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetWhere(s => s.MovieId == request.MovieId, tracking: false)
            .OrderBy(s => s.StartDatetime)
            .Select(s => new ShowtimeDto
            {
                Id = s.Id,
                MovieId = s.MovieId,
                HallId = s.HallId,
                StartDatetime = s.StartDatetime,
                BasePrice = s.BasePrice,
                Format = s.Format
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
