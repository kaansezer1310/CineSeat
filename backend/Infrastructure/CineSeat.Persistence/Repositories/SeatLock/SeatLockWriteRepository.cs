using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class SeatLockWriteRepository : WriteRepository<SeatLock>, ISeatLockWriteRepository
{
    public SeatLockWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
