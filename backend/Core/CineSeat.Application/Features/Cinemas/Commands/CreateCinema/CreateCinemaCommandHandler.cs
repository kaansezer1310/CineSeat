using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Commands.CreateCinema;

public class CreateCinemaCommandHandler : IRequestHandler<CreateCinemaCommand, long>
{
    private readonly ICinemaWriteRepository _write;
    private readonly IDistrictReadRepository _districtRead;

    public CreateCinemaCommandHandler(ICinemaWriteRepository write, IDistrictReadRepository districtRead)
    {
        _write = write;
        _districtRead = districtRead;
    }

    public async Task<long> Handle(CreateCinemaCommand request, CancellationToken cancellationToken)
    {
        var district = await _districtRead.GetByIdAsync(request.DistrictId, tracking: false, cancellationToken);
        if (district is null)
            throw new NotFoundException("İlçe", request.DistrictId);

        var cinema = new Cinema
        {
            Name = request.Name,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            DistrictId = request.DistrictId
        };

        await _write.AddAsync(cinema, cancellationToken);
        await _write.SaveAsync(cancellationToken);

        return cinema.Id;
    }
}
