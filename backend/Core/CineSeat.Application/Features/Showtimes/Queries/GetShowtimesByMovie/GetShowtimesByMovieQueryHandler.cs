using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByMovie;

public class GetShowtimesByMovieQueryHandler
    : IRequestHandler<GetShowtimesByMovieQuery, PagedResult<ShowtimeDto>>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetShowtimesByMovieQueryHandler(IShowtimeReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<PagedResult<ShowtimeDto>> Handle(
        GetShowtimesByMovieQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _read.GetWhere(s => s.MovieId == request.MovieId, tracking: false);

        var totalCount = await _executor.CountAsync(baseQuery, cancellationToken);

        var pageQuery = baseQuery
            .OrderBy(s => s.StartDatetime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new ShowtimeDto
            {
                Id = s.Id,
                MovieId = s.MovieId,
                HallId = s.HallId,
                StartDatetime = s.StartDatetime,
                BasePrice = s.BasePrice,
                Format = s.Format
            });

        var items = await _executor.ToListAsync(pageQuery, cancellationToken);

        return new PagedResult<ShowtimeDto>(items, totalCount, request.PageNumber, request.PageSize);
    }
}
