using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class HallWriteRepository : WriteRepository<Hall>, IHallWriteRepository
{
    public HallWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
