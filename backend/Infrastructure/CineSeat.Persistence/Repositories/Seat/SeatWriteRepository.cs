using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class SeatWriteRepository : WriteRepository<Seat>, ISeatWriteRepository
{
    public SeatWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
