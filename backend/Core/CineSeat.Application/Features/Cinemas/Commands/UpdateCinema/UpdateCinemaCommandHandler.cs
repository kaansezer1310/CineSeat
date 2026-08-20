using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Commands.UpdateCinema;

public class UpdateCinemaCommandHandler : IRequestHandler<UpdateCinemaCommand, Unit>
{
    private readonly ICinemaReadRepository _read;
    private readonly ICinemaWriteRepository _write;
    private readonly IDistrictReadRepository _districtRead;

    public UpdateCinemaCommandHandler(
        ICinemaReadRepository read,
        ICinemaWriteRepository write,
        IDistrictReadRepository districtRead)
    {
        _read = read;
        _write = write;
        _districtRead = districtRead;
    }

    public async Task<Unit> Handle(UpdateCinemaCommand request, CancellationToken cancellationToken)
    {
        var cinema = await _read.GetByIdAsync(request.Id, tracking: true, cancellationToken);
        if (cinema is null)
            throw new NotFoundException("Sinema", request.Id);

        var district = await _districtRead.GetByIdAsync(request.DistrictId, tracking: false, cancellationToken);
        if (district is null)
            throw new NotFoundException("İlçe", request.DistrictId);

        cinema.Name = request.Name;
        cinema.Address = request.Address;
        cinema.Latitude = request.Latitude;
        cinema.Longitude = request.Longitude;
        cinema.DistrictId = request.DistrictId;

        _write.Update(cinema);
        await _write.SaveAsync(cancellationToken);

        return Unit.Value;
    }
}
