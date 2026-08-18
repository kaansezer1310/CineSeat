using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class DistrictWriteRepository : WriteRepository<District>, IDistrictWriteRepository
{
    public DistrictWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
