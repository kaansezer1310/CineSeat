using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class SeatReadRepository : ReadRepository<Seat>, ISeatReadRepository
{
    public SeatReadRepository(ApplicationDbContext context) : base(context)
    {
    }
}
