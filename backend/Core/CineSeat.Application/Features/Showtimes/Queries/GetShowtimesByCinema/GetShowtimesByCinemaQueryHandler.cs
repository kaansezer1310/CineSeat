using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Showtimes.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Showtimes.Queries.GetShowtimesByCinema;

public class GetShowtimesByCinemaQueryHandler : IRequestHandler<GetShowtimesByCinemaQuery, List<ShowtimeDto>>
{
    private readonly IShowtimeReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetShowtimesByCinemaQueryHandler(IShowtimeReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<ShowtimeDto>> Handle(GetShowtimesByCinemaQuery request, CancellationToken cancellationToken)
    {
        // Seans → Salon → Sinema: navigation üzerinden filtre (EF SQL JOIN'e çevirir).
        var query = _read.GetWhere(s => s.Hall.CinemaId == request.CinemaId, tracking: false)
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
