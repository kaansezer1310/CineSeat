using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class DistrictReadRepository : ReadRepository<District>, IDistrictReadRepository
{
    public DistrictReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
