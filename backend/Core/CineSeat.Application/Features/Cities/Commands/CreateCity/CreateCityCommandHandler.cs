using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CineSeat.Application.Features.Cities.Commands.CreateCity;

public class CreateCityCommandHandler : IRequestHandler<CreateCityCommand, long>
{
    private readonly ICityWriteRepository _cityWriteRepository;

    public CreateCityCommandHandler(ICityWriteRepository cityWriteRepository)
    {
        _cityWriteRepository = cityWriteRepository;
    }

    public async Task<long> Handle(CreateCityCommand request, CancellationToken cancellationToken)
    {
        var city = new City
        {
            CityName = request.CityName
        };

        await _cityWriteRepository.AddAsync(city, cancellationToken);
        await _cityWriteRepository.SaveAsync(cancellationToken);

        return city.Id;
    }
}
