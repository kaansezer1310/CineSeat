using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Halls.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Halls.Queries.GetHallsByCinema;

public class GetHallsByCinemaQueryHandler : IRequestHandler<GetHallsByCinemaQuery, List<HallDto>>
{
    private readonly IHallReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetHallsByCinemaQueryHandler(IHallReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<HallDto>> Handle(GetHallsByCinemaQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetWhere(h => h.CinemaId == request.CinemaId, tracking: false)
            .Select(h => new HallDto { Id = h.Id, Name = h.Name, CinemaId = h.CinemaId });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
