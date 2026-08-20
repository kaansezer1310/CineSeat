using CineSeat.Application.Features.Technologies.DTOs;
using MediatR;

namespace CineSeat.Application.Features.Technologies.Queries.GetAllTechnologies;

public class GetAllTechnologiesQuery : IRequest<List<TechnologyDto>>
{
}
