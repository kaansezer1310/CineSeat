using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Technologies.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Queries.GetTechnologyById;

public class GetTechnologyByIdQueryHandler : IRequestHandler<GetTechnologyByIdQuery, TechnologyDto>
{
    private readonly ITechnologyReadRepository _read;

    public GetTechnologyByIdQueryHandler(ITechnologyReadRepository read) => _read = read;

    public async Task<TechnologyDto> Handle(GetTechnologyByIdQuery request, CancellationToken cancellationToken)
    {
        var technology = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (technology is null)
            throw new NotFoundException("Teknoloji", request.Id);

        return new TechnologyDto { Id = technology.Id, Name = technology.Name };
    }
}
