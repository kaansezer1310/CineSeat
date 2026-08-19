using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class HallTechWriteRepository : WriteRepository<HallTech>, IHallTechWriteRepository
{
    public HallTechWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
