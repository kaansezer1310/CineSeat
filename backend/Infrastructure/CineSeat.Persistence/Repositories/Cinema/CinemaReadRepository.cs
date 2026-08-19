using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class CinemaReadRepository : ReadRepository<Cinema>, ICinemaReadRepository
{
    public CinemaReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
