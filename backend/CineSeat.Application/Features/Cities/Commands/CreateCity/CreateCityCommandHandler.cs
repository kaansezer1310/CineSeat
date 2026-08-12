using CineSeat.Application.Common.Interfaces;
using CineSeat.Domain.Entities;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CineSeat.Application.Features.Cities.Commands.CreateCity;

public class CreateCityCommandHandler : IRequestHandler<CreateCityCommand, long>
{
    private readonly IApplicationDbContext _context;

    public CreateCityCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<long> Handle(CreateCityCommand request, CancellationToken cancellationToken)
    {
        var city = new City
        {
            CityName = request.CityName
        };

        _context.Cities.Add(city);
        await _context.SaveChangesAsync(cancellationToken);

        return city.Id;
    }
}
