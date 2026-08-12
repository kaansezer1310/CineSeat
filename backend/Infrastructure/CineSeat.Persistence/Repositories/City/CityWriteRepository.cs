using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CityWriteRepository : WriteRepository<City>, ICityWriteRepository
{
    public CityWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
