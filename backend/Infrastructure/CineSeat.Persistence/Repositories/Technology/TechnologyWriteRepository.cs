using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class TechnologyWriteRepository : WriteRepository<Technology>, ITechnologyWriteRepository
{
    public TechnologyWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
