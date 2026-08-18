using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Districts.Commands.UpdateDistrict;

public class UpdateDistrictCommandHandler : IRequestHandler<UpdateDistrictCommand, Unit>
{
    private readonly IDistrictReadRepository _read;
    private readonly IDistrictWriteRepository _write;
    private readonly ICityReadRepository _cityRead;

    public UpdateDistrictCommandHandler(
        IDistrictReadRepository read,
        IDistrictWriteRepository write,
        ICityReadRepository cityRead)
    {
        _read = read;
        _write = write;
        _cityRead = cityRead;
    }

    public async Task<Unit> Handle(UpdateDistrictCommand request, CancellationToken cancellationToken)
    {
        var district = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (district is null)
            throw new NotFoundException("İlçe", request.Id);

        var city = await _cityRead.GetByIdAsync(request.CityId, tracking: false, cancellationToken);
        if (city is null)
            throw new NotFoundException("Şehir", request.CityId);

        district.DistrictName = request.DistrictName;
        district.CityId = request.CityId;

        _write.Update(district);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
