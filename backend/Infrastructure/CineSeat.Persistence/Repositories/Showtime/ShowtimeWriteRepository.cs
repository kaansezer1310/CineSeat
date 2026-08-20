using CineSeat.Application.Repositories;
using CineSeat.Domain.Entities;
using CineSeat.Persistence.Data;

namespace CineSeat.Persistence.Repositories;

public class ShowtimeWriteRepository : WriteRepository<Showtime>, IShowtimeWriteRepository
{
    public ShowtimeWriteRepository(ApplicationDbContext context) : base(context)
    {
    }
}
