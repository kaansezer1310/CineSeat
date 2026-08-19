using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Seats.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Seats.Queries.GetSeatMap;

public class GetSeatMapQueryHandler : IRequestHandler<GetSeatMapQuery, List<SeatDto>>
{
    private readonly ISeatReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetSeatMapQueryHandler(ISeatReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<SeatDto>> Handle(GetSeatMapQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetWhere(s => s.HallId == request.HallId, tracking: false)
            .OrderBy(s => s.SeatRow).ThenBy(s => s.SeatColumn)
            .Select(s => new SeatDto
            {
                Id = s.Id,
                Type = s.Type,
                HallId = s.HallId,
                SeatRow = s.SeatRow,
                SeatColumn = s.SeatColumn,
                IsActive = s.IsActive
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
