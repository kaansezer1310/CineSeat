using CineSeat.Application.Common.Exceptions;
using CineSeat.Application.Features.Cinemas.DTOs;
using CineSeat.Application.Repositories;
using MediatR;

namespace CineSeat.Application.Features.Cinemas.Queries.GetCinemaById;

public class GetCinemaByIdQueryHandler : IRequestHandler<GetCinemaByIdQuery, CinemaDto>
{
    private readonly ICinemaReadRepository _read;

    public GetCinemaByIdQueryHandler(ICinemaReadRepository read) => _read = read;

    public async Task<CinemaDto> Handle(GetCinemaByIdQuery request, CancellationToken cancellationToken)
    {
        var cinema = await _read.GetByIdAsync(request.Id, tracking: false, cancellationToken);
        if (cinema is null)
            throw new NotFoundException("Sinema", request.Id);

        return new CinemaDto
        {
            Id = cinema.Id,
            Name = cinema.Name,
            Address = cinema.Address,
            Latitude = cinema.Latitude,
            Longitude = cinema.Longitude,
            DistrictId = cinema.DistrictId
        };
    }
}
