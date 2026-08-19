using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class TechnologyReadRepository : ReadRepository<Technology>, ITechnologyReadRepository
{
    public TechnologyReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
