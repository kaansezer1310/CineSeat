using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CityReadRepository : ReadRepository<City>, ICityReadRepository
{
    public CityReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
