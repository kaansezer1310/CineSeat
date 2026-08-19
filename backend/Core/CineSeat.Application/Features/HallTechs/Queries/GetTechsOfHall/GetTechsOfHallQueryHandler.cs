using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.HallTechs.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.HallTechs.Queries.GetTechsOfHall;

public class GetTechsOfHallQueryHandler : IRequestHandler<GetTechsOfHallQuery, List<HallTechDto>>
{
    private readonly IHallTechReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetTechsOfHallQueryHandler(IHallTechReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<HallTechDto>> Handle(GetTechsOfHallQuery request, CancellationToken cancellationToken)
    {
        // Technology.Name için navigation üzerinden JOIN.
        var query = _read.GetWhere(ht => ht.HallId == request.HallId, tracking: false)
            .Select(ht => new HallTechDto
            {
                Id = ht.Id,
                HallId = ht.HallId,
                TechnologyId = ht.TechnologyId,
                TechnologyName = ht.Technology.Name
            });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
