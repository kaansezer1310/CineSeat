using CineSeat.Application.Common.Interfaces;
using CineSeat.Application.Features.Technologies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Queries.GetAllTechnologies;

public class GetAllTechnologiesQueryHandler : IRequestHandler<GetAllTechnologiesQuery, List<TechnologyDto>>
{
    private readonly ITechnologyReadRepository _read;
    private readonly IAsyncQueryExecutor _executor;

    public GetAllTechnologiesQueryHandler(ITechnologyReadRepository read, IAsyncQueryExecutor executor)
    {
        _read = read;
        _executor = executor;
    }

    public async Task<List<TechnologyDto>> Handle(GetAllTechnologiesQuery request, CancellationToken cancellationToken)
    {
        var query = _read.GetAll(tracking: false)
            .Select(t => new TechnologyDto { Id = t.Id, Name = t.Name });

        return await _executor.ToListAsync(query, cancellationToken);
    }
}
