using CineSeat.Application.Features.Technologies.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Queries.GetTechnologyById;

public class GetTechnologyByIdQuery : IRequest<TechnologyDto>
{
    public long Id { get; set; }
}
