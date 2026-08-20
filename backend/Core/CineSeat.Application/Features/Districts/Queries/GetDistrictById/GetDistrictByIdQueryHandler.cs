using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Districts.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Districts.Queries.GetDistrictById;

public class GetDistrictByIdQueryHandler : IRequestHandler<GetDistrictByIdQuery, DistrictDto>
{
    private readonly IDistrictReadRepository _read;

    public GetDistrictByIdQueryHandler(IDistrictReadRepository read) => _read = read;

    public async Task<DistrictDto> Handle(GetDistrictByIdQuery request, CancellationToken cancellationToken)
    {
        var district = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (district is null)
            throw new NotFoundException("İlçe", request.Id);

        return new DistrictDto
        {
            Id = district.Id,
            DistrictName = district.DistrictName,
            CityId = district.CityId
        };
    }
}
