using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class HallReadRepository : ReadRepository<Hall>, IHallReadRepository
{
    public HallReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
