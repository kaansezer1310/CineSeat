using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.CreateDistrict;

public class CreateDistrictCommandHandler : IRequestHandler<CreateDistrictCommand, long>
{
    private readonly IDistrictWriteRepository _write;
    private readonly ICityReadRepository _cityRead;

    public CreateDistrictCommandHandler(IDistrictWriteRepository write, ICityReadRepository cityRead)
    {
        _write = write;
        _cityRead = cityRead;
    }

    public async Task<long> Handle(CreateDistrictCommand request, CancellationToken cancellationToken)
    {
        // FK bütünlüğü: ilçe eklenmeden önce şehir var mı?
        var city = await _cityRead.GetByIdAsync(request.CityId, tracking: false, cancellationToken);
        if (city is null)
            throw new NotFoundException("Şehir", request.CityId);

        var district = new District
        {
            DistrictName = request.DistrictName,
            CityId = request.CityId
        };

        await _write.AddAsync(district, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return district.Id;
    }
}
