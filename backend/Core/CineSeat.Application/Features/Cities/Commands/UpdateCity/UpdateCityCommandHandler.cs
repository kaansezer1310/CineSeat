using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cities.Commands.UpdateCity;

public class UpdateCityCommandHandler : IRequestHandler<UpdateCityCommand, Unit>
{
    private readonly ICityReadRepository _read;
    private readonly ICityWriteRepository _write;

    public UpdateCityCommandHandler(ICityReadRepository read, ICityWriteRepository write)
    {
        _read = read;
        _write = write;
    }

    public async Task<Unit> Handle(UpdateCityCommand request, CancellationToken cancellationToken)
    {
        // tracking: true → EF değişikliği izler; SaveAsync farkı yazar.
        var city = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (city is null)
            throw new NotFoundException("Şehir", request.Id);

        city.CityName = request.CityName;

        _write.Update(city);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
