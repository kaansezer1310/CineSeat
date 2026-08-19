using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class HallTechReadRepository : ReadRepository<HallTech>, IHallTechReadRepository
{
    public HallTechReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
