using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class SeatLockReadRepository : ReadRepository<SeatLock>, ISeatLockReadRepository
{
    public SeatLockReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
